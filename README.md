# GeometryWhiteboard

## Online example

A working example can be found at [geometrywhiteboard.herokuapp.com/](http://geometrywhiteboard.herokuapp.com/)

## Quick Start

Requires [latest Node.js](https://nodejs.org/en/download/current/) which includes `npm` package manager.

Then, navigate to repository and install dependencies:

`npm i`

Start Express server to serve client at `http://localhost:2000`:

`npm start`

## Usage

Once the dependencies have been installed and the server is started using the instructions above, the application can then be accessed by navigating to `http://localhost:2000` in a browser. The application can most effectively be viewed by opening two tabs and placing them adjacent to each other to demonstrate the live collaboration abilities of the application.

### Top Menu

| Name                   | Description                                                                                                                                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New                    | Discard the current whiteboard state and start with a new, blank one                                                                                                                                                                                     |
| Save                   | Opens a dialog box to save the state of the whiteboard to the Mongo database. User's have the ability to set the name of their saved whiteboard and whether it should be private (private whiteboard can only be seen by the user that created them)     |
| Open                   | Opens a dialog box to load a saved whiteboard from the Mongo database. The dialog box presents a list of saved whiteboards and their owners (and will only show whiteboards you have access to). Clicking the name of a whiteboard will open it for you. |
| Find Room              | Opens a dialog box with a list of available Rooms to Join. Clicking on the name of the room will allow you to join it.                                                                                                                                   |
| Make Room              | Opens a dialog box to create a new collaboration room. The name of the room can then be set by the user creating it.                                                                                                                                     |
| Leave Room             | Only visible while in a room. Clicking this will cause you to leave the current room you are in.                                                                                                                                                         |
| Sign Up/Log In/Log Out | Allow you to sign up (which gives you the ability to create rooms and save drawings), login to a previously created account, or log out of the currently logged in account                                                                               |

### Drawing Tools (in order from top)

| Name   | Description                                                                                                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Move   | Allows users to pan around the whiteboard by clicking and dragging the mouse                                                                                                                    |
| Point  | Allows a user to create a point by clicking the location in the whiteboard they wish to place it                                                                                                |
| Line   | Lines are defined by two points, which are created by clicking the mouse in the two desired locations for the points                                                                            |
| Circle | Users can create a circle by clicking where they wish the circle to be centered, and then dragging out to the desired radius                                                                    |
| Delete | Allows users to delete previously created objects by clicking on them. If an object is deleted that another object depends on, the object depending on the deleted object will also be deleted. |

### Chat

Chat is implemented by broadcasting messages as they are sent to all of the clients currently connected to the server. If a user is signed in, their username will be displayed to other connected clients along with their message. If a user is not signed in, their name will be Guest followed by a simple hash of the id of their socket on the server. Chat messages are not stored in the Mongo database.

### Rooms

Rooms are the part of the project that allows for users to collaborate in real time. When users join a room, their mouse movements are broadcast to other users in the room, and changes they make to the whiteboard are sent to the server for verification before being distributed to connected clients.
