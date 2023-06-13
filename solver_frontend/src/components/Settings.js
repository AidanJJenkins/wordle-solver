import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import { Col, Form, Button, FormGroup, Label, Input, Row, Alert } from 'reactstrap'
import Navbar from './Navbar'
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Yup from "yup";
import jwt_decode from "jwt-decode";

const settingsSchema = Yup.object().shape({
  username: Yup.string(),
  email: Yup.string().email('Invalid email address'),
  password: Yup.string(),
})

function Settings() {
  const navigate = useNavigate()

  let [disabled, setDisabled] = useState(true)
  let [error, setError] = useState({username: "", email: "", password: ""})

  let token = localStorage.getItem('token')
  let decoded = jwt_decode(token);
  
 useEffect(() => {
    const fetchSettings = async () => {
     const response = await axios.get(`http://localhost:8000/api/users/${decoded.user_id}`)
      const {username, email, password} = response.data
      setForm({
        username: username,
        email: email,
        //password: password
      })
    }
    fetchSettings()
  }, [])

  let [form, setForm] = useState({username: '', email: '', password: ''})


  useEffect(() => {
    settingsSchema.isValid(form).then(valid => {
      setDisabled(!valid)
    })
  },[form])


  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })

    Yup
      .reach(settingsSchema, e.target.name)
      .validate(e.target.value)
      .then(valid => {
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

  function handleSubmit(e){
    e.preventDefault()
     axios.put(`http://localhost:8000/api/users/${decoded.user_id}`, form)
      .then((res) => {
        console.log(res.data)
      })
      .catch(function (error) {
        console.log(error);
      });
    navigate("/solver")
    //setForm(initialValues)
    console.log(form)
  }

  return (
    <div>
    <Navbar />
    <div class="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15vh', maxHeight: '100vh' }}>
      <Col sm="6">
        <h2 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh'}}> Settings</h2>
        <Form onSubmit={e => handleSubmit(e)}>
          <FormGroup>
            <Label for="exampleUsername">
              Username
            </Label>
            <Input
              value={form.username} 
              onChange={e => handleChange(e)} 
              name="username"
              placeholder={form.username}
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
              placeholder={form.email}
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
          </Row>
        </Form>
      </Col>
    </div>
    </div>
  );
}

export default Settings;
