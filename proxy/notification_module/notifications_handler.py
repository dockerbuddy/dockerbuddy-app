class NotificationHandler:
    def __init__(self, app_logger, socketio):
        self.previous_levels = {}
        self.app_logger = app_logger
        self.socketio = socketio

    def handle_influx_message(self, message):
        level = message['_level']
        check = message['_check_name']

        self.app_logger.info(self.previous_levels)
        self.app_logger.info(level)
        if check in self.previous_levels and level == self.previous_levels[check]:
            return

        self.previous_levels[check] = level

        if level == 'ok':
            return

        # send message to frontend
        self.app_logger.info(level)
        self.socketio.emit('notification', message, broadcast=True)
