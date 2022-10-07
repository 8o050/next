# -----------------------------------------------------------------------------
#  Copyright (c) SAGE3 Development Team
#
#  Distributed under the terms of the SAGE3 License.  The full license is in
#  the file LICENSE, distributed as part of this software.
# -----------------------------------------------------------------------------

from smartbits.smartbit import SmartBit, ExecuteInfo
from smartbits.smartbit import TrackedBaseModel
import json

class SageCellState(TrackedBaseModel):
    code: str
    output: str
    kernels: str
    executeInfo: ExecuteInfo


class SageCell(SmartBit):
    # the key that is assigned to this in state is
    state: SageCellState

    def __init__(self, **kwargs):
        # THIS ALWAYS NEEDS TO HAPPEN FIRST!!
        super(SageCell, self).__init__(**kwargs)

    def handle_exec_result(self, msg):
        self.state.output = json.dumps(msg)
        self.state.executeInfo.executeFunc = ""
        self.state.executeInfo.params = {}
        self.send_updates()

    def get_kernels(self):
        if self._jupyter_client.available_kernels:
            self.state.kernels = json.dumps(self._jupyter_client.available_kernels)
        else:
            print('no kernels available')
        self.state.executeInfo.executeFunc = ""
        self.state.executeInfo.params = {}
        self.send_updates()

    def execute(self, uuid):
        """
        Non blocking function to execute code. The proxy has the responsibility to execute the code
        and to call a call_back function which know how to handle the results message
        :param uuid:
        :param code:
        :return:
        """
        command_info = {
            "uuid": uuid,
            "call_fn": self.handle_exec_result,
            "code": self.state.code,
            "kernel": "",
            "token": ""
        }

        # print(f"Command info is {command_info}")
        # print(f"My proxy is: {self._jupyter_proxy}")
        self._jupyter_client.execute(command_info)
