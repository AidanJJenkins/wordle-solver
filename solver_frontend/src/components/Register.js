import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom"
import axios from 'axios'
import { Col, Spinner, Form, Button, FormGroup, Label, Input, Row, Alert } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Yup from "yup";
import { useCookies } from 'react-cookie'

const registerSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
})

function CreateUser() {
  const navigate = useNavigate()

  let initialValues = {
    email: '',
    username: '',
    password: ''
  }

  let [form, setForm] = useState(initialValues)
  let [disabled, setDisabled] = useState(true)
  let [error, setError] = useState({username: "", email: "", password: ""})
  let [customError, setCustomError] = useState("")
  let [spinnerOn, setSpinnerOn] = useState(false)
  const [cookies, setCookie] = useCookies(['refresh_token'])

  useEffect(() => {
    registerSchema.isValid(form).then(valid => {
      setDisabled(!valid)
    })
  },[form])


  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })

    Yup
      .reach(registerSchema, e.target.name)
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
    setSpinnerOn(true)
     axios.post('http://localhost:8000/register', form)
      .then((res) => {
        console.log(res)
        localStorage.setItem("access-token", res.data.access)
        setCookie('refresh_token', res.data.refresh)
        setSpinnerOn(false)
        navigate("/solver")
        setForm(initialValues)
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          setSpinnerOn(false)
          console.log(error.response.data);
          setCustomError(error.response.data)
        } else {
          console.log(error);
        }
      });
  }

  return (
    <div class="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15vh', maxHeight: '100vh' }}>
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
          { error.username.length > 0 && <Alert color="danger">{error.username}</Alert> }
          { error.email.length > 0 && <Alert color="danger">{error.email}</Alert> }
          { error.password.length > 0 && <Alert color="danger">{error.password}</Alert> }
          { customError.length > 0 && <Alert color="danger">{customError}</Alert> }
          <Row>
            <Col md="8">
              <Button color='primary' class="submit" type="submit" disabled={disabled}>
                { spinnerOn && <Spinner style={{ height: "1rem", width: "1rem"}}size="xs">Loading...</Spinner> }
                <span>
                  {' '}Submit
                </span>
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
