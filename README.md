# Chat Room

##### A Socket.IO & NodeJs Chat Room implementation

* The Express server serves html, which includes the chat UI.
* Socket events handle the forwarding of messages and user creation.
* Namespace Socket broadcasts all updates in available users and their status.
* Realtime chat messages are volatile and stored on the client side.