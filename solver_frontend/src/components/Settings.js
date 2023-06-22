import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { Col, Form, Button, FormGroup, Label, Input, Row, Alert } from 'reactstrap'
import Navbar from './Navbar'
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Yup from "yup";
import jwt_decode from "jwt-decode";
import DeleteModal from './DeleteModal';

const settingsSchema = Yup.object().shape({
  username: Yup.string(),
  email: Yup.string().email('Invalid email address'),
  password: Yup.string(),
})

function Settings() {
  let [disabled, setDisabled] = useState(true)
  let [error, setError] = useState({username: "", email: "", password: ""})

  let token = localStorage.getItem('access-token')
  let decoded = jwt_decode(token);
  let [form, setForm] = useState({username: "", email: "", password: ""})

 useEffect(() => {
    const fetchSettings = async () => {
     const response = await axios.get(`http://localhost:8080/api/users/${decoded.user_id}`)
      let {username, email} = response.data
      setForm({
        username: username,
        email: email,
      })
    }
    fetchSettings()
  }, [decoded.user_id])


  useEffect(() => {
    settingsSchema.isValid(form).then(valid => {
      setDisabled(!valid)
    })
  })

  function handleChange(e) {
    let { name, value } = e.target
    setForm({ ...form, [name]: value })

    Yup
      .reach(settingsSchema, e.target.name)
      .validate(e.target.value)
      .then(valid => {
        console.log(valid)
        setError({
          ...error, [e.target.name]: ""
        });
      })
      .catch(err => {
        setError({
          ...error, [e.target.name]: err.errors[0]
        });
      });

  }

  const updateUserPassword = () => {
     axios.put(`http://localhost:8080/api/users/update_password/${decoded.user_id}`, {password: form.password})
      .then((res) => {
        console.log(res.data)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const updateUser = () => {
     axios.put(`http://localhost:8080/api/users/update/${decoded.user_id}`, {username: form.username, email: form.email})
      .then((res) => {
        console.log(res.data)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function handleSubmit(){
    if (form.password !== undefined || form.password !== ""){
      console.log("updated password, username, and email")
      updateUserPassword()
      updateUser()
    } else {
      console.log("updated username and email")
      updateUser()
    }
    setForm({password: ""})
  }

  return (
    <div>
    <Navbar />
    <div class="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15vh', maxHeight: '100vh' }}>
      <Col sm="6">
        <h2 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh'}}> Settings</h2>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="exampleUsername">
              Username
            </Label>
            <Input
              value={form.username} 
              onChange={e => handleChange(e)} 
              name="username"
              type="text"
            />
          </FormGroup>
          <FormGroup>
            <Label for="exampleEmail">
              Email
            </Label>
            <Input
              onChange={e => handleChange(e)} 
              value={form.email} 
              name="email"
              type="text"
            />
          </FormGroup>
          <FormGroup>
            <Label for="examplePassword">
              Password
            </Label>
            <Input
              onChange={e => handleChange(e)} 
              value={form.password} 
              name="password"
              placeholder={"*********"}
              type="text"
            />
          </FormGroup>
          { error.username.length > 0 && <Alert color="danger">{error.username}</Alert> }
          { error.email.length > 0 && <Alert color="danger">{error.email}</Alert> }
          { error.password.length > 0 && <Alert color="danger">{error.password}</Alert> }
          <Row>
            <Col md="8">
              <Button color='primary' class="submit" type="submit" disabled={disabled}>
                Update
              </Button>
            </Col>
            <Col className="d-flex justify-content-end">
              <DeleteModal decodedId={decoded.user_id} />
            </Col>
          </Row>
        </Form>
      </Col>
    </div>
    </div>
  );
}

export default Settings;
