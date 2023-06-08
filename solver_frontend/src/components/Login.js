import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom"
import axios from 'axios'
import { Col, Form, Button, FormGroup, Label, Input, Row } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const navigate = useNavigate()
  let initialValues = {
    username: '',
    password: ''
  }

  let [loginForm, setLoginForm] = useState(initialValues)

  function handleChange(e) {
    const { name, value } = e.target
    setLoginForm({ ...loginForm, [name]: value })
  }

  function handleSubmit(e){
    e.preventDefault()
    axios.post('http://localhost:8000/api/users/login', loginForm)
      .then((res) => {
        console.log(res.status)
        localStorage.setItem("token", res.data)
        navigate("/solver")
        setLoginForm(initialValues)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <div class="loginContainer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Col sm="4">
        <h2 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh'}}> Login</h2>
        <Form onSubmit={e => handleSubmit(e)}>
          <FormGroup>
            <Label for="exampleUsername">
              Username
            </Label>
            <Input
              id="exampleUsername"
              value={loginForm.username} 
              onChange={e => handleChange(e)} 
              name="username"
              placeholder="JohnSmith123"
              type="username"
            />
          </FormGroup>
          <FormGroup>
            <Label for="examplePassword">
              Password
            </Label>
            <Input
              id="examplePassword"
              onChange={e => handleChange(e)} 
              value={loginForm.password} 
              name="password"
              placeholder="***************"
              type="password"
            />
          </FormGroup>
          <Row>
            <Col md="8">
              <Button color='primary' outline class="submit" type="submit">
                Submit
              </Button>
            </Col>
            <Col>
              <div>
                <p>
                  <span style={{ fontSize: '0.9em' }}>
                  Don't have an account?{' '}
                  <Link to="/register">Click here to register.</Link>
                  </span>
                </p>
              </div>
            </Col>
          </Row>
        </Form>
      </Col>
    </div>
  );
}

export default Login;
