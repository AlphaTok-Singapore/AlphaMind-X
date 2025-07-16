from flask import Blueprint, request, jsonify
from models.alphamind import db, Dataset, KnowledgeBase
from datetime import datetime
import json

data_bp = Blueprint('data', __name__)

# Dataset Management APIs
@data_bp.route('/datasets', methods=['GET'])
def get_datasets():
    """获取用户的所有数据集"""
    user_id = request.args.get('user_id', 1)
    type_filter = request.args.get('type')
    status_filter = request.args.get('status')
    search = request.args.get('search')

    query = Dataset.query.filter_by(user_id=user_id)

    if type_filter and type_filter != 'all':
        query = query.filter_by(type=type_filter)

    if status_filter:
        query = query.filter_by(status=status_filter)

    if search:
        query = query.filter(Dataset.name.contains(search) | Dataset.description.contains(search))

    datasets = query.order_by(Dataset.created_at.desc()).all()

    return jsonify({
        'success': True,
        'data': [dataset.to_dict() for dataset in datasets]
    })

@data_bp.route('/datasets', methods=['POST'])
def create_dataset():
    """创建新数据集"""
    data = request.get_json()

    required_fields = ['name', 'type']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'error': f'{field} is required'
            }), 400

    dataset = Dataset(
        name=data['name'],
        description=data.get('description', ''),
        type=data['type'],
        size=data.get('size', '0 MB'),
        record_count=data.get('record_count', 0),
        status=data.get('status', 'uploading'),
        file_path=data.get('file_path', ''),
        user_id=data.get('user_id', 1)
    )

    db.session.add(dataset)
    db.session.commit()

    return jsonify({
        'success': True,
        'data': dataset.to_dict()
    })

@data_bp.route('/datasets/<int:dataset_id>', methods=['GET'])
def get_dataset(dataset_id):
    """获取单个数据集详情"""
    dataset = Dataset.query.get(dataset_id)
    if not dataset:
        return jsonify({
            'success': False,
            'error': 'Dataset not found'
        }), 404

    return jsonify({
        'success': True,
        'data': dataset.to_dict()
    })

@data_bp.route('/datasets/<int:dataset_id>', methods=['PUT'])
def update_dataset(dataset_id):
    """更新数据集"""
    data = request.get_json()

    dataset = Dataset.query.get(dataset_id)
    if not dataset:
        return jsonify({
            'success': False,
            'error': 'Dataset not found'
        }), 404

    # 更新字段
    if 'name' in data:
        dataset.name = data['name']
    if 'description' in data:
        dataset.description = data['description']
    if 'status' in data:
        dataset.status = data['status']
    if 'size' in data:
        dataset.size = data['size']
    if 'record_count' in data:
        dataset.record_count = data['record_count']

    if data.get('status') in ['ready', 'processing']:
        dataset.last_processed = datetime.utcnow()

    db.session.commit()

    return jsonify({
        'success': True,
        'data': dataset.to_dict()
    })

@data_bp.route('/datasets/<int:dataset_id>', methods=['DELETE'])
def delete_dataset(dataset_id):
    """删除数据集"""
    dataset = Dataset.query.get(dataset_id)
    if not dataset:
        return jsonify({
            'success': False,
            'error': 'Dataset not found'
        }), 404

    db.session.delete(dataset)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Dataset deleted successfully'
    })

# Knowledge Base Management APIs
@data_bp.route('/knowledge-bases', methods=['GET'])
def get_knowledge_bases():
    """获取用户的所有知识库"""
    user_id = request.args.get('user_id', 1)
    status_filter = request.args.get('status')

    query = KnowledgeBase.query.filter_by(user_id=user_id)

    if status_filter:
        query = query.filter_by(status=status_filter)

    knowledge_bases = query.order_by(KnowledgeBase.updated_at.desc()).all()

    return jsonify({
        'success': True,
        'data': [kb.to_dict() for kb in knowledge_bases]
    })

@data_bp.route('/knowledge-bases', methods=['POST'])
def create_knowledge_base():
    """创建新知识库"""
    data = request.get_json()

    required_fields = ['name']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'error': f'{field} is required'
            }), 400

    knowledge_base = KnowledgeBase(
        name=data['name'],
        description=data.get('description', ''),
        embedding_model=data.get('embedding_model', 'text-embedding-ada-002'),
        vector_store=data.get('vector_store', 'Pinecone'),
        document_count=data.get('document_count', 0),
        status=data.get('status', 'building'),
        user_id=data.get('user_id', 1),
        datasets=json.dumps(data.get('datasets', []))
    )

    db.session.add(knowledge_base)
    db.session.commit()

    return jsonify({
        'success': True,
        'data': knowledge_base.to_dict()
    })

@data_bp.route('/knowledge-bases/<int:kb_id>', methods=['GET'])
def get_knowledge_base(kb_id):
    """获取单个知识库详情"""
    kb = KnowledgeBase.query.get(kb_id)
    if not kb:
        return jsonify({
            'success': False,
            'error': 'Knowledge base not found'
        }), 404

    return jsonify({
        'success': True,
        'data': kb.to_dict()
    })

@data_bp.route('/knowledge-bases/<int:kb_id>', methods=['PUT'])
def update_knowledge_base(kb_id):
    """更新知识库"""
    data = request.get_json()

    kb = KnowledgeBase.query.get(kb_id)
    if not kb:
        return jsonify({
            'success': False,
            'error': 'Knowledge base not found'
        }), 404

    # 更新字段
    if 'name' in data:
        kb.name = data['name']
    if 'description' in data:
        kb.description = data['description']
    if 'embedding_model' in data:
        kb.embedding_model = data['embedding_model']
    if 'vector_store' in data:
        kb.vector_store = data['vector_store']
    if 'status' in data:
        kb.status = data['status']
    if 'document_count' in data:
        kb.document_count = data['document_count']
    if 'datasets' in data:
        kb.datasets = json.dumps(data['datasets'])

    kb.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'success': True,
        'data': kb.to_dict()
    })

@data_bp.route('/knowledge-bases/<int:kb_id>', methods=['DELETE'])
def delete_knowledge_base(kb_id):
    """删除知识库"""
    kb = KnowledgeBase.query.get(kb_id)
    if not kb:
        return jsonify({
            'success': False,
            'error': 'Knowledge base not found'
        }), 404

    db.session.delete(kb)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Knowledge base deleted successfully'
    })

@data_bp.route('/knowledge-bases/<int:kb_id>/rebuild', methods=['POST'])
def rebuild_knowledge_base(kb_id):
    """重建知识库"""
    kb = KnowledgeBase.query.get(kb_id)
    if not kb:
        return jsonify({
            'success': False,
            'error': 'Knowledge base not found'
        }), 404

    # 模拟重建过程
    kb.status = 'building'
    kb.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Knowledge base rebuild started',
        'data': kb.to_dict()
    })

@data_bp.route('/knowledge-bases/<int:kb_id>/search', methods=['POST'])
def search_knowledge_base(kb_id):
    """在知识库中搜索"""
    data = request.get_json()
    query = data.get('query', '')

    if not query:
        return jsonify({
            'success': False,
            'error': 'Search query is required'
        }), 400

    kb = KnowledgeBase.query.get(kb_id)
    if not kb:
        return jsonify({
            'success': False,
            'error': 'Knowledge base not found'
        }), 404

    # 模拟搜索结果
    search_results = [
        {
            'id': 1,
            'content': f'This is a sample search result for query: "{query}"',
            'score': 0.95,
            'source': 'document_1.pdf',
            'metadata': {'page': 1, 'section': 'Introduction'}
        },
        {
            'id': 2,
            'content': f'Another relevant result matching: "{query}"',
            'score': 0.87,
            'source': 'document_2.pdf',
            'metadata': {'page': 3, 'section': 'Methods'}
        }
    ]

    return jsonify({
        'success': True,
        'data': {
            'query': query,
            'results': search_results,
            'total_results': len(search_results)
        }
    })

@data_bp.route('/data/stats', methods=['GET'])
def get_data_stats():
    """获取数据统计信息"""
    user_id = request.args.get('user_id', 1)

    total_datasets = Dataset.query.filter_by(user_id=user_id).count()
    total_knowledge_bases = KnowledgeBase.query.filter_by(user_id=user_id).count()
    active_knowledge_bases = KnowledgeBase.query.filter_by(user_id=user_id, status='active').count()
    total_documents = db.session.query(db.func.sum(KnowledgeBase.document_count)).filter_by(user_id=user_id).scalar() or 0

    return jsonify({
        'success': True,
        'data': {
            'total_datasets': total_datasets,
            'total_knowledge_bases': total_knowledge_bases,
            'active_knowledge_bases': active_knowledge_bases,
            'total_documents': total_documents
        }
    })

