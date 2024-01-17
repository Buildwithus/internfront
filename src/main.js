import './App.css'
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Tableapp() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("")
  const [currentpage, setCurrentpage] = useState(1)
  const records = 5;
  const no_of_page = Math.ceil(users.length / records)
  const lastindex = currentpage * records;
  const firstindex = lastindex - records;
  const nextpage = () => {
    if (currentpage < no_of_page) {
      setCurrentpage(currentpage + 1);
    } else {
      setCurrentpage(currentpage)
    }
  }
  const previouspage = () => {
    if (currentpage > 1) {
      setCurrentpage(currentpage - 1)
    } else {
      setCurrentpage(currentpage)
    }
  }
  useEffect(() => {
    fetchUsers();

    socket.on('userChange', (data) => {
      handleUserChange(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchUsers = async () => {
    const response = await fetch('http://localhost:5000/api/users');
    const data = await response.json();
    setUsers(data);
  };

  const createUser = async () => {
    const name = prompt('Enter Name:');
    const phone = prompt('Enter Phone:');
    const address = prompt('Enter Address:');
    const role = prompt('Enter Role:');
    const userid = prompt('Enter UserId:');
    const email = prompt('Enter email:');

    await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, phone, address, role, userid, email }),
    });
    fetchUsers();
  };

  const updateUser = async (userId, updatedData) => {

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('Failed to update')
      }
    } catch (error) {
      console.log("error updating user")
    }

    fetchUsers();
  };

  const deleteUser = async (userId) => {
    await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'DELETE',
    });
    fetchUsers();
  };

  const handleUserChange = (data) => {
    const { action, user } = data;
    switch (action) {
      case 'delete':
        setUsers((prevUsers) => prevUsers.filter((u) => u._id !== user._id));
        break;
      default:
        setUsers((prevUsers) => [...prevUsers, user]);
    }
  };

  return (
    <div className='center'  >
      <h1 className='center'>User Management System</h1>
      <button className='center update-btn' onClick={createUser}>Create User</button>
      <div>
        <form>
          <input className='inpt-section' placeholder='Search Here...' type='search' onChange={(e) => setSearch(e.target.value.toLowerCase())}></input>
        </form>
      </div>
      <table className='table-center'>
        <thead>
          <tr>
            <th>UserId</th>
            <th>User Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody >
          {users.filter((d) => {
            return search === "" ? d : d.name.toLowerCase().includes(search)
          }).slice(firstindex, lastindex).map((user) => (
            <tr key={user._id}>
              <td>{user.userid}</td>
              <td >{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.address}</td>
              <td>{user.role}</td>
              <td>
                <button className='update-btn' onClick={() => updateUser(user._id, { name: prompt('Enter new Name'), phone: prompt('Enter new Phone'), address: prompt("Enter new Address"), role: prompt('Enter new Role') })}>Update</button>
                <button className='delete-btn' onClick={() => deleteUser(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='last-section'>
        <button className='prev-btn' onClick={previouspage}> Prev</button>
        <h4>{currentpage}</h4>
        <button className='next-btn' onClick={nextpage}> Next</button>
      </div>

    </div>
  );
}

export default Tableapp;

