"""
n8n 集成服务
"""

import logging
from typing import Any, Optional

import requests

logger = logging.getLogger(__name__)

class N8NService:
    """n8n 集成服务类"""

    def __init__(self, n8n_endpoint: str, n8n_user: str, n8n_password: str):
        self.n8n_endpoint = n8n_endpoint
        self.n8n_auth = (n8n_user, n8n_password)
        self.session = requests.Session()
        self.session.auth = self.n8n_auth

    def test_connection(self) -> bool:
        """测试n8n连接"""
        try:
            response = self.session.get(f"{self.n8n_endpoint}/healthz", timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.exception("n8n连接测试失败")
            return False

    def get_workflows(self) -> list[dict[str, Any]]:
        """获取工作流列表"""
        try:
            response = self.session.get(f"{self.n8n_endpoint}/api/v1/workflows", timeout=10)

            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
            else:
                logger.error(f"获取工作流列表失败: {response.status_code}")
                return []

        except Exception as e:
            logger.exception("获取工作流列表失败")
            return []

    def get_workflow(self, workflow_id: str) -> Optional[dict[str, Any]]:
        """获取特定工作流详情"""
        try:
            response = self.session.get(
                f"{self.n8n_endpoint}/api/v1/workflows/{workflow_id}",
                timeout=10
            )

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"获取工作流详情失败: {response.status_code}")
                return None

        except Exception as e:
            logger.exception("获取工作流详情失败")
            return None

    def execute_workflow(self, workflow_id: str, input_data: Optional[dict[str, Any]] = None) -> dict[str, Any]:
        """执行工作流"""
        try:
            payload = {
                'data': input_data or {}
            }

            response = self.session.post(
                f"{self.n8n_endpoint}/api/v1/workflows/{workflow_id}/execute",
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"执行工作流失败: {response.status_code}")
                return {
                    'success': False,
                    'error': f'HTTP {response.status_code}',
                    'message': '工作流执行失败'
                }

        except Exception as e:
            logger.exception("执行工作流失败")
            return {
                'success': False,
                'error': str(e),
                'message': '工作流执行异常'
            }

    def trigger_webhook(self, webhook_path: str, data: Optional[dict[str, Any]] = None) -> dict[str, Any]:
        """触发webhook"""
        try:
            webhook_url = f"{self.n8n_endpoint}/webhook/{webhook_path}"

            response = requests.post(
                webhook_url,
                json=data or {},
                timeout=30
            )

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"触发webhook失败: {response.status_code}")
                return {
                    'success': False,
                    'error': f'HTTP {response.status_code}',
                    'message': 'Webhook触发失败'
                }

        except Exception as e:
            logger.exception("触发webhook失败")
            return {
                'success': False,
                'error': str(e),
                'message': 'Webhook触发异常'
            }

    def get_executions(self, workflow_id: Optional[str] = None, limit: int = 20) -> list[dict[str, Any]]:
        """获取执行历史"""
        try:
            params = {'limit': limit}
            if workflow_id:
                params['workflowId'] = workflow_id

            response = self.session.get(
                f"{self.n8n_endpoint}/api/v1/executions",
                params=params,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
            else:
                logger.error(f"获取执行历史失败: {response.status_code}")
                return []

        except Exception as e:
            logger.exception("获取执行历史失败")
            return []

    def get_execution(self, execution_id: str) -> Optional[dict[str, Any]]:
        """获取特定执行详情"""
        try:
            response = self.session.get(
                f"{self.n8n_endpoint}/api/v1/executions/{execution_id}",
                timeout=10
            )

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"获取执行详情失败: {response.status_code}")
                return None

        except Exception as e:
            logger.exception("获取执行详情失败")
            return None

    def stop_execution(self, execution_id: str) -> bool:
        """停止执行"""
        try:
            response = self.session.delete(
                f"{self.n8n_endpoint}/api/v1/executions/{execution_id}",
                timeout=10
            )

            return response.status_code == 200

        except Exception as e:
            logger.exception("停止执行失败")
            return False

    def activate_workflow(self, workflow_id: str) -> bool:
        """激活工作流"""
        try:
            response = self.session.patch(
                f"{self.n8n_endpoint}/api/v1/workflows/{workflow_id}",
                json={'active': True},
                timeout=10
            )

            return response.status_code == 200

        except Exception as e:
            logger.exception("激活工作流失败")
            return False

    def deactivate_workflow(self, workflow_id: str) -> bool:
        """停用工作流"""
        try:
            response = self.session.patch(
                f"{self.n8n_endpoint}/api/v1/workflows/{workflow_id}",
                json={'active': False},
                timeout=10
            )

            return response.status_code == 200

        except Exception as e:
            logger.exception("停用工作流失败")
            return False

    def create_workflow(self, workflow_data: dict[str, Any]) -> Optional[dict[str, Any]]:
        """创建工作流"""
        try:
            response = self.session.post(
                f"{self.n8n_endpoint}/api/v1/workflows",
                json=workflow_data,
                timeout=10
            )

            if response.status_code == 201:
                return response.json()
            else:
                logger.error(f"创建工作流失败: {response.status_code}")
                return None

        except Exception as e:
            logger.exception("创建工作流失败")
            return None

    def update_workflow(self, workflow_id: str, workflow_data: dict[str, Any]) -> Optional[dict[str, Any]]:
        """更新工作流"""
        try:
            response = self.session.patch(
                f"{self.n8n_endpoint}/api/v1/workflows/{workflow_id}",
                json=workflow_data,
                timeout=10
            )

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"更新工作流失败: {response.status_code}")
                return None

        except Exception as e:
            logger.exception("更新工作流失败")
            return None

    def delete_workflow(self, workflow_id: str) -> bool:
        """删除工作流"""
        try:
            response = self.session.delete(
                f"{self.n8n_endpoint}/api/v1/workflows/{workflow_id}",
                timeout=10
            )

            return response.status_code == 200

        except Exception as e:
            logger.exception("删除工作流失败")
            return False

    def get_credentials(self) -> list[dict[str, Any]]:
        """获取凭据列表"""
        try:
            response = self.session.get(f"{self.n8n_endpoint}/api/v1/credentials", timeout=10)

            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
            else:
                logger.error(f"获取凭据列表失败: {response.status_code}")
                return []

        except Exception as e:
            logger.exception("获取凭据列表失败")
            return []

