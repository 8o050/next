# TODO: should this have it's own SageComm info or should it use the proxy instead?
import time

import asyncio
import threading
import redis
import requests
from config import config as conf, prod_type
import json


class Borg:
    """
    The Borg pattern to store execution state across instances
    """
    _shared_state = {}

    def __init__(self):
        self.__dict__ = self._shared_state


class JupyterKernelClient(Borg):
    """
    Jupyter kernel is responsible for
    """

    def __init__(self, url, startup_timeout=60):
        Borg.__init__(self)
        if not hasattr(self, "redis_serve"):
            self.url = url
            # TODO: change port so it's read from configuration
            self.redis_server = redis.StrictRedis(host=conf[prod_type]["redis_server"], port=6379, db=0)
            self.pubsub = self.redis_server.pubsub()
            self.pubsub.subscribe('jupyter_outputs')

            # start an independent listening process.
            self.stop_thread = False  # keep on checking until this changes to false
            self.msg_checker = threading.Thread(target=self.process_reponse)
            self.msg_checker.start()
            self.callback_info = {}
            self.available_kernels = {}

    def set_available_kernels(self):
        pass
        # jupyter_token = self.redis_server.get("config:jupyter:token")
        # headers = {'Authorization': f"Token  {jupyter_token.decode()}"}
        # j_url = f"{conf[prod_type]['jupyter_server']}/api/kernels"
        # response = requests.get(j_url, headers=headers)
        # kernels = json.loads(response.text)
        # self.available_kernels = {x["id"]: x["id"] for x in kernels}

    # execut a command
    def execute(self, command_info):
        """
        :param command_info: a dict with 5 keys, 1- uuid, 2-call_fn, a callback function, 3 code to run, 4: kernel id,
        5: token
        :return:
        """
        user_passed_uuid = command_info["uuid"]
        callback_fn = command_info["call_fn"]

        payload = json.dumps({
            "kernel": command_info["kernel"],
            "token": command_info["token"],
            "code": command_info["code"]
        })
        headers = {
            'Content-Type': 'application/json'
        }

        try:
            msg = requests.post(self.url, headers=headers, data=payload).json()
        except:
            raise Exception(f"couldn't run code on {self.url}")

        self.callback_info[msg['request_id']] = (user_passed_uuid, callback_fn)
        return msg

    def process_reponse(self):
        check_kernels_every = 10  # check
        while not self.stop_thread:
            msg = self.pubsub.get_message()
            if msg:
                # ignore first message
                if msg["data"] == 1:
                    continue
                msg = msg['data'].decode("utf-8")
                msg = eval(msg)
                request_id = msg['request_id']
                if request_id in self.callback_info:
                    self.callback_info[request_id][1](msg)

            time.sleep(1)  # be nice to the system :)
            if check_kernels_every == 0:
                # TODO: check if kernels changed and update accordingly
                self.set_available_kernels()

                check_kernels_every = 10
            else:
                check_kernels_every -= 1
