const express = require('express');
const shortid = require('shortid');

const server = express();

server.use(express.json());

// Fake DB
let users = [
  { id: shortid.generate(), name: 'Jane Doe', bio: 'Some Random Jane' }
];

// Helper Functions
const User = {
  getAll() {
    return users;
  },
  getById(id) {
    return users.find(user => user.id === id);
  },
  createNew(user) {
    const newUser = { id: shortid.generate(), ...user };
    users.push(newUser);
    return newUser;
  },
  delete(id) {
    const deletedUser = users.find(user => user.id === id);
    if(deletedUser) {
      users = users.filter(usersInList => usersInList.id !== id);
    }
    return deletedUser;
  },
  update(id, changes) {
    const newUser = users.find(user => user.id === id);
    if (!newUser) {
      return null;
    } else {
      const updatedUser = { id, ...changes }
      users = users.map(user => {
        if(user.id === id) {
          return updatedUser
        }
        return user
      })
      return updatedUser
    }
  }
};

// User Endpoints
server.post('/api/users', (req, res) => {
  const userFromClient = req.body;
  if(!userFromClient.name || !userFromClient.bio) {
    res.status(400).json({ errorMessage: "Please provide name and bio for the user." });
  } else {
    const brandNewUser = User.createNew(userFromClient);
    brandNewUser.name && brandNewUser.bio
      ? res.status(201).json(brandNewUser) 
      : res.status(500).json({ errorMessage: "There was an error while saving the user to the database" });
  }
});
server.get('/api/users', (req, res) => {
  const allUsers = User.getAll();
  allUsers === users 
    ? res.status(200).json(allUsers)
    : res.status(500).json({ errorMessage: "The users information could not be retrieved." });
});
server.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const user = User.getById(id);
  if(user.id) {
    res.status(200);
  } else if(!user.id) {
    res.status(404).json({ message: "The user with the specified ID does not exist." });
  } else {
    res.status(500).json({ errorMessage: "The user information could not be retrieved." });
  }
});
server.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const deleted = User.delete(id);
  if(deleted) {
    res.statusCode(200).json(deleted);
  } else if(!deleted.id) {
    res.status(404).json({ message: "The user with the specified ID does not exist." });
  } else {
    res.status(500).json({ errorMessage: "The user could not be removed" });
  }
});
server.put('/api/users/:id', (req, res) => {
  const changes = req.body;
  const { id } = req.params;
  const updatedUser = User.update(id, changes)
  if(updatedUser) {
    res.status(200).json(updatedUser)
  } else if(!updatedUser.id) {
    res.status(404).json({ message: "The user with the specified ID does not exist." })
  } else if(!changes.name || !changes.bio) {
    res.status(400).json({ errorMessage: "Please provide name and bio for the user." })
  } else {
    res.status(500).json({ errorMessage: "The user information could not be modified." })
  }
});