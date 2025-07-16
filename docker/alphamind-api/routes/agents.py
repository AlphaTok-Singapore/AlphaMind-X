from flask import Blueprint, request, jsonify
from models.alphamind import db, Agent
from datetime import datetime
import json

agents_bp = Blueprint('agents', __name__)

@agents_bp.route('/agents', methods=['GET'])
def get_agents():
    """获取用户的所有智能体"""
    user_id = request.args.get('user_id', 1)
    category = request.args.get('category')
    status = request.args.get('status')
    search = request.args.get('search')

    query = Agent.query.filter_by(user_id=user_id)

    if category and category != 'all':
        query = query.filter_by(category=category)

    if status:
        query = query.filter_by(status=status)

    if search:
        query = query.filter(Agent.name.contains(search) | Agent.description.contains(search))

    agents = query.order_by(Agent.updated_at.desc()).all()

    return jsonify({
        'success': True,
        'data': [agent.to_dict() for agent in agents]
    })

@agents_bp.route('/agents', methods=['POST'])
def create_agent():
    """创建新智能体"""
    data = request.get_json()

    required_fields = ['name', 'category']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'error': f'{field} is required'
            }), 400

    agent = Agent(
        name=data['name'],
        description=data.get('description', ''),
        avatar=data.get('avatar', '🤖'),
        category=data['category'],
        status=data.get('status', 'draft'),
        user_id=data.get('user_id', 1),
        skills=json.dumps(data.get('skills', [])),
        mcp_tools=json.dumps(data.get('mcp_tools', [])),
        system_prompt=data.get('system_prompt', ''),
        model_config=json.dumps(data.get('model_config', {}))
    )

    db.session.add(agent)
    db.session.commit()

    return jsonify({
        'success': True,
        'data': agent.to_dict()
    })

@agents_bp.route('/agents/<int:agent_id>', methods=['GET'])
def get_agent(agent_id):
    """获取单个智能体详情"""
    agent = Agent.query.get(agent_id)
    if not agent:
        return jsonify({
            'success': False,
            'error': 'Agent not found'
        }), 404

    return jsonify({
        'success': True,
        'data': agent.to_dict()
    })

@agents_bp.route('/agents/<int:agent_id>', methods=['PUT'])
def update_agent(agent_id):
    """更新智能体"""
    data = request.get_json()

    agent = Agent.query.get(agent_id)
    if not agent:
        return jsonify({
            'success': False,
            'error': 'Agent not found'
        }), 404

    # 更新字段
    if 'name' in data:
        agent.name = data['name']
    if 'description' in data:
        agent.description = data['description']
    if 'avatar' in data:
        agent.avatar = data['avatar']
    if 'category' in data:
        agent.category = data['category']
    if 'status' in data:
        agent.status = data['status']
    if 'skills' in data:
        agent.skills = json.dumps(data['skills'])
    if 'mcp_tools' in data:
        agent.mcp_tools = json.dumps(data['mcp_tools'])
    if 'system_prompt' in data:
        agent.system_prompt = data['system_prompt']
    if 'model_config' in data:
        agent.model_config = json.dumps(data['model_config'])

    agent.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'success': True,
        'data': agent.to_dict()
    })

@agents_bp.route('/agents/<int:agent_id>', methods=['DELETE'])
def delete_agent(agent_id):
    """删除智能体"""
    agent = Agent.query.get(agent_id)
    if not agent:
        return jsonify({
            'success': False,
            'error': 'Agent not found'
        }), 404

    db.session.delete(agent)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Agent deleted successfully'
    })

@agents_bp.route('/agents/<int:agent_id>/execute', methods=['POST'])
def execute_agent(agent_id):
    """执行智能体"""
    data = request.get_json()

    agent = Agent.query.get(agent_id)
    if not agent:
        return jsonify({
            'success': False,
            'error': 'Agent not found'
        }), 404

    if agent.status != 'active':
        return jsonify({
            'success': False,
            'error': 'Agent is not active'
        }), 400

    # 更新使用统计
    agent.usage_count += 1
    agent.last_used = datetime.utcnow()

    # 模拟执行结果
    execution_result = {
        'agent_id': agent_id,
        'input': data.get('input', ''),
        'output': f"Agent '{agent.name}' executed successfully with input: {data.get('input', '')}",
        'execution_time': 1.5,
        'success': True
    }

    # 更新成功率（简化计算）
    if execution_result['success']:
        agent.success_rate = min(100.0, agent.success_rate + 0.1)

    db.session.commit()

    return jsonify({
        'success': True,
        'data': execution_result
    })

@agents_bp.route('/agents/<int:agent_id>/clone', methods=['POST'])
def clone_agent(agent_id):
    """克隆智能体"""
    original_agent = Agent.query.get(agent_id)
    if not original_agent:
        return jsonify({
            'success': False,
            'error': 'Agent not found'
        }), 404

    cloned_agent = Agent(
        name=f"{original_agent.name} (Copy)",
        description=original_agent.description,
        avatar=original_agent.avatar,
        category=original_agent.category,
        status='draft',
        user_id=original_agent.user_id,
        skills=original_agent.skills,
        mcp_tools=original_agent.mcp_tools,
        system_prompt=original_agent.system_prompt,
        model_config=original_agent.model_config
    )

    db.session.add(cloned_agent)
    db.session.commit()

    return jsonify({
        'success': True,
        'data': cloned_agent.to_dict()
    })

@agents_bp.route('/agents/stats', methods=['GET'])
def get_agent_stats():
    """获取智能体统计信息"""
    user_id = request.args.get('user_id', 1)

    total_agents = Agent.query.filter_by(user_id=user_id).count()
    active_agents = Agent.query.filter_by(user_id=user_id, status='active').count()
    total_executions = db.session.query(db.func.sum(Agent.usage_count)).filter_by(user_id=user_id).scalar() or 0
    avg_success_rate = db.session.query(db.func.avg(Agent.success_rate)).filter_by(user_id=user_id).scalar() or 0

    return jsonify({
        'success': True,
        'data': {
            'total_agents': total_agents,
            'active_agents': active_agents,
            'total_executions': total_executions,
            'avg_success_rate': round(avg_success_rate, 1)
        }
    })

