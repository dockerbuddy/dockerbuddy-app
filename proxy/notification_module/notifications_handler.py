
class NotificationHandler:
    def __init__(self, app_logger, socketio):
        self.previous_level = 'ok'
        self.app_logger = app_logger
        self.socketio = socketio

    def handle_influx_message(self, message):
        level = message['_level']
        self.socketio.emit('notification', message, broadcast=True)
        if level == self.previous_level:
            return
        self.previous_level = level

        if level == 'ok':
            return
        # send message to frontend
        self.app_logger.info(level)


    def push_message(self, message):
        pass