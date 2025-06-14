"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("./socket");
socket_1.app.get('/', (req, res) => {
    res.send('Backend running successfully!');
});
const port = process.env.BACKEND_PORT;
if (!port) {
    socket_1.logger.error('ENV NOT FOUND');
}
else {
    socket_1.server.listen(port, () => socket_1.logger.info(`App runing at: ${port}`));
}
