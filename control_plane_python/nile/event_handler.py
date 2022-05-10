from typing import Callable
import logging

logger = logging.getLogger(__name__)

class EventHandler:
    def __init__(self, nile_client, entity, type):
        self.nile_client = nile_client
        self.entity = entity
        self.event_type = type

    def handle(self, handler, token=None): # temporary, this will register handlers and run a background loop to grab events and handle them
        instances = self.nile_client.get_instances(self.entity, token)

        for instance in instances:
            if instance['properties']['system']['event'] == self.event_type:
                handler(instance)

