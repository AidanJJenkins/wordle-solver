import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom"
import axios from 'axios'
import { Col, Form, Button, FormGroup, Label, Input, Row } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

function CreateUser() {
  const navigate = useNavigate()

  let initialValues = {
    email: '',
    username: '',
    password: ''
  }

  let [form, setForm] = useState(initialValues)

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  function handleSubmit(e){
    e.preventDefault()
     axios.post('http://localhost:8000/api/users/register', form)
      .then((res) => {
        console.log(res.data)
      })
      .catch(function (error) {
        console.log(error);
      });
    navigate("/login")
    setForm(initialValues)
  }

  return (
    <div class="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Col sm="6">
        <h2 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh'}}> Create Account</h2>
        <Form onSubmit={e => handleSubmit(e)}>
          <FormGroup>
            <Label for="exampleUsername">
              Username
            </Label>
            <Input
              id="exampleUsername"
              value={form.username} 
              onChange={e => handleChange(e)} 
              name="username"
              placeholder="JohnSmith123"
              type="username"
            />
          </FormGroup>
          <FormGroup>
            <Label for="exampleEmail">
              Email
            </Label>
            <Input
              id="exampleEmail"
              onChange={e => handleChange(e)} 
              value={form.email} 
              name="email"
              placeholder="johnsmith@email.com"
              type="email"
            />
          </FormGroup>
          <FormGroup>
            <Label for="examplePassword">
              Password
            </Label>
            <Input
              id="examplePassword"
              onChange={e => handleChange(e)} 
              value={form.password} 
              name="password"
              placeholder="password12345"
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
                  Already have an account?{' '}
                  <Link to="/login">Click here to login.</Link>
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

export default CreateUser;
