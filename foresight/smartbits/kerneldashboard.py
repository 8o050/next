# -----------------------------------------------------------------------------
#  Copyright (c) SAGE3 Development Team
#
#  Distributed under the terms of the SAGE3 License.  The full license is in
#  the file LICENSE, distributed as part of this software.
# -----------------------------------------------------------------------------

from smartbits.smartbit import SmartBit, ExecuteInfo
from smartbits.smartbit import TrackedBaseModel
import json
import websocket
import threading
from pydantic import PrivateAttr
import time
from config import config as conf, prod_type
import requests
import redis


class KernelDashboardState(TrackedBaseModel):
    """
    This class represents the state of the kernel dashboard
    """
    kernels: list = []
    sessions: list = []
    defaultKernel: str = ""
    kernelSpecs: list = []
    executeInfo: ExecuteInfo

class KernelDashboard(SmartBit):
    state: KernelDashboardState
    _headers = PrivateAttr()
    _base_url = PrivateAttr()
    _msg_checker = PrivateAttr()
    # _jupyter_token = PrivateAttr()
    # _msg_checker = threading.Thread(target=self.process_every)

    def __init__(self, **kwargs):
        super(KernelDashboard, self).__init__(**kwargs)
        redis_server = redis.StrictRedis(host=conf[prod_type]["redis_server"], port=6379, db=0)
        jupyter_token = redis_server.get("config:jupyter:token").decode()
        self._headers = {'Authorization': f"Token  {jupyter_token}"}
        self._base_url = f"{conf[prod_type]['jupyter_server']}/api"
        self._msg_checker = threading.Thread(target=self.process_every)
        self._msg_checker.start()

    def get_headers(self):
        return self._headers

    def get_base_url(self):
        return self._base_url

    def get_kernel_specs(self):
        j_url = self.get_base_url() + '/kernelspecs'
        response = requests.get(j_url, headers=self.get_headers())
        kernel_specs = json.loads(response.text)
        self.state.defaultKernel = kernel_specs['default']
        self.state.kernelSpecs = [kernel_specs]
        self.state.executeInfo.executeFunc = ""
        self.state.executeInfo.params = {}
        self.send_updates()

    def get_kernels(self):
        j_url = self.get_base_url() + '/kernels'
        response = requests.get(j_url, headers=self.get_headers())
        kernels = json.loads(response.text)
        return kernels

    def get_sessions(self):
        j_url = self.get_base_url() + '/sessions'
        response = requests.get(j_url, headers=self.get_headers())
        sessions = json.loads(response.text)
        return sessions

    def add_kernel(self, kernel_name="python3", path="/boards"):
        j_url = self.get_base_url() + '/kernels'
        body = {"name": kernel_name, "path": path}
        response = requests.post(j_url, headers=self.get_headers(), json=body)
        if response.status_code == 200:
            self.refresh_list()

    def delete_kernel(self, kernel_id):
        j_url = f'{self.get_base_url()}/kernels/{kernel_id}'
        response = requests.delete(j_url, headers=self.get_headers())
        if response.status_code == 200:
            self.refresh_list()
        else:
            print(response.text)

    def restart_kernel(self, kernel_id):
        j_url = f'{self.get_base_url()}/kernels/{kernel_id}/restart'
        response = requests.post(j_url, headers=self.get_headers())
        json.loads(response.text)
        self.refresh_list()

    # def add_session(self, kernel_id):
    #     j_url = f'{self.get_base_url()}/sessions'
    #     data = {"kernel": {"id": kernel_id}}
    #     response = requests.post(j_url, headers=self.get_headers(), json=data)
    #     json.loads(response.text)
    #     self.refresh_list()

    # def delete_session(self, session_id):
    #     j_url = f'{self.get_base_url()}/sessions/{session_id}'
    #     response = requests.delete(j_url, headers=self.get_headers())
    #     json.loads(response.text)
    #     self.refresh_list()

    def refresh_list(self):
        self.state.kernels = self.get_kernels()
        self.state.sessions = self.get_sessions() 
        self.state.executeInfo.executeFunc = ""
        self.state.executeInfo.params = {}
        self.send_updates()

    def process_every(self, seconds=1):
        # TODO: check if kernels changed and only refresh if they did
        while True:
            if self.state.kernels != self.get_kernels() or self.state.sessions != self.get_sessions():
                self.refresh_list()
            if self.state.executeInfo.executeFunc == "refresh_list":
                self.refresh_list()
            time.sleep(seconds)