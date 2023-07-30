import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from "react-router-dom"
import axios from 'axios'
import { Col, Form, Spinner, Button, FormGroup, Label, Input, Row, Alert, } from 'reactstrap'
import { useCookies } from 'react-cookie'
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Yup from "yup";
  
const loginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
})

function Login() {
  const navigate = useNavigate()
  let initialValues = {
    username: '',
    password: ''
  }

  let [loginForm, setLoginForm] = useState(initialValues)
  let [disabled, setDisabled] = useState(true)
  let [error, setError] = useState({username: "", password: ""})
  let [spinnerOn, setSpinnerOn] = useState(false)
  const [cookies, setCookie] = useCookies(['refresh_token'])

  useEffect(() => {
    loginSchema.isValid(loginForm).then(valid => {
      setDisabled(!valid)
    })
  },[loginForm])

  function handleChange(e) {
    const { name, value } = e.target
    setLoginForm({ ...loginForm, [name]: value })

    Yup
      .reach(loginSchema, e.target.name)
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
    axios.post('http://localhost:8000/login', loginForm)
      .then((res) => {
        localStorage.setItem("access-token", res.data.access)
        setCookie('refresh_token', res.data.refresh)
        setSpinnerOn(false)
        navigate("/solver")
        setLoginForm(initialValues)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <div class="loginContainer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15vh', maxHeight: '50vh' }}>
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
          { error.username.length > 0 && <Alert color="danger">{error.username}</Alert> }
          { error.password.length > 0 && <Alert color="danger">{error.password}</Alert> }
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
