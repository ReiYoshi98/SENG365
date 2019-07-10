<template>
  <div>
    <!-- Navigation bar -->
    <div class="row">
        <div class="logBtn" v-if="this.$cookie.get('authToken')" v-on:click="logoutUser()">
          <a type=button href="#logout" class="btn btn-info btn-lg">Logout</a>
        </div>
        <div v-else>
          <div class="mainBtn">
            <a type="button" href="#register" class="btn btn-info btn-lg" data-toggle="modal" data-target="#registerModal">Register</a>
            <a type="button" href="#login" class="btn btn-info btn-lg" data-toggle="modal" data-target="#loginModal">Login</a>
          </div>
          <div id="registerModal" class="modal fade" role="dialog">
            <div class="modal-dialog">
              <div v-if="errorFlag" class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <strong>{{error}}</strong>.
              </div>
              <!-- Modal content -->
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal">&times;</button>
                  <h4 class="modal-title">Register new user</h4>
                </div>
                <div class="modal-body">
                  <h1>Register</h1>
                  <v-app>
                    <v-alert v-if="errorFlag" color="error" icon="warning" value="true">
                      {{error}}
                    </v-alert>
                    <v-form v-on:submit.prevent="addUser()"
                            ref="form"
                            v-model="valid"
                            lazy-validation
                    >
                      <v-text-field
                        v-model="firstName"
                        label="First name"
                        required
                      ></v-text-field>

                      <v-text-field
                        v-model="lastName"
                        label="Last name"
                        required
                      ></v-text-field>

                      <v-text-field
                        v-model="username"
                        label="Username"
                        :counter="10"
                        :rules="nameRules"
                        required
                      ></v-text-field>

                      <v-text-field
                        v-model="email"
                        label="E-mail"
                        :rules="emailRules"
                        required
                      ></v-text-field>

                      <v-text-field
                        v-model="password"
                        name="password"
                        label="Password"
                        type="password"
                        required
                      ></v-text-field>

                      <v-text-field
                        v-model="repassword"
                        name="Re-type password"
                        label="re-password"
                        type="password"
                        :rules="[checkPasswords]"
                        required
                      ></v-text-field>

                      <v-btn
                        color="success"
                        type="submit"
                      >
                        Register
                      </v-btn>

                      <v-btn
                        color="error"
                        @click="reset"
                      >
                        Reset Form
                      </v-btn>

                    </v-form>
                  </v-app>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
          <!-- Trigger the Login modal -->
          <div id="loginModal" class="modal fade" role="dialof">
            <div class="modal-dialog">
              <!-- Modal content -->
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal">&times;</button>
                  <h4 class="modal-title">User Login</h4>
                </div>
                <div class="modal-body">
                  <h1>Login</h1>
                  <v-app>
                    <v-alert v-if="errorFlag" color="error" icon="warning" value="true">
                      {{error}}
                    </v-alert>
                  <v-form v-on:submit.prevent="loginUser()"
                    ref="form"
                    v-model="valid"
                    lazy-validation
                  >
                    <v-text-field
                      v-model="username"
                      :counter="10"
                      :rules="loginRules"
                      label="username"
                      required
                    ></v-text-field>

                    <v-text-field
                      v-model="email"
                      :rules="loginRules"
                      label="E-mail"
                      required
                    ></v-text-field>

                    <v-text-field
                      v-model="password"
                      name="password"
                      label="Password"
                      type="password"
                      required
                    ></v-text-field>

                    <v-btn
                      color="success"
                      type="submit"
                    >
                      Login
                    </v-btn>

                    <v-btn
                      color="error"
                      @click="reset"
                    >
                      Reset Form
                    </v-btn>

                  </v-form>
                </v-app>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    <div class="navBtn">
      <router-link to="venues" tag="button" class="button">Look at venues</router-link>
      <router-link to="users" tag="button" class="button">User profiles</router-link>
    </div>
    <div class="main">
    </div>
  </div>
</template>

<style scoped>

  .mainBtn {
    padding-top: 300px;
    width: 30%;
    margin: 0 auto;
  }

  .logBtn {
    padding-top: 100px;
    padding-right: 50px;
    width: 30%;
    margin: 0 auto;
    float: right;
  }

  .alert {
    padding: 20px;
    background-color: #F39C12;
    color: white;
  }

  .closebtn {
    margin-left: 15px;
    color: white;
    font-weight: bold;
    float: right;
    font-size: 22px;
    line-height: 20px;
    cursor: pointer;
    transition: 0.3s;
  }

  .closebtn:hover {
    color: black;
  }

  .button {
    position: relative;
  }

  .navBtn {
    padding-top: 80px;
  }

  .logBtn a {
    display: block;
    color: white;
    text-align: center;
    padding: 10px 4px;
    text-decoration: none;
    font-family: Arial;
    margin-right: 10px;
    margin-top: 10px;
    border: solid;
    border-color: #00B4CC;
  }

  /* Links inside the navbar */
   .mainBtn a {
    display: block;
    color: white;
    text-align: center;
    padding: 10px 4px;
    text-decoration: none;
    font-family: Arial;
     margin-right: 10px;
     margin-top: 10px;
     border: solid;
     border-color: #00B4CC;
  }


  /* Change background on mouse-over */
   a:hover {
    background: #00B4CC;
    color: black;
  }

  /* Clear floats after the columns */
  .main{
    text-align: center;
  }

  input {
    width: 80%;
  }

  .modal-content {
    text-align: center;
  }


</style>

<script>

  export default {
    data() {
      return {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        error: '',
        errorFlag: false,
        password: '',
        repassword: '',
        valid: true,
        name: '',
        nameRules: [
          v => (v && v.length <= 64) || 'Name must be less than 64 characters'
        ],
        emailRules: [
          v => /.+@.+/.test(v) || 'E-mail must be valid'
        ],
        loginRules:[
          (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v)||/^[a-zA-Z0-9_]*$/.test(v) || 'Username or E-mail must be valid'],
      }
    },

    methods: {

      checkPasswords:function(){
        return this.password !== this.repassword ? "Passwords do not match": true;
      },

      addUser: function() {

        if (this.firstName === ''){
          alert("Please enter your name!")
        }
        if (this.lastName === ''){
          alert("Please enter your last name!")
        }
        if (this.username === '') {
          alert("Please enter a username!")
        }
        if (this.username.length > 64) {
          alert("Username must be within 64 characters length")
        }
        if (this.email === '') {
          alert("Please enter a valid email address")
        }
        if (this.password === '') {
          alert("Please enter a password")
        }
        if (this.password !== this.repassword) {
          alert("Passwords do not match")
        }
        else {
          this.$http.post('http://localhost:4941/api/v1/users/', JSON.stringify({
            "username": this.username,
            "givenName": this.firstName,
            "familyName": this.lastName,
            "email": this.email,
            "password": this.password
          })).then(function (response) {
            this.$http.post('http://localhost:4941/api/v1/users/login/', JSON.stringify({
              "username": this.username,
              "email": this.email,
              "password": this.password
            }), {
              headers: {
                'Content-Type': 'application/json'
              }}).then(function (response) {

              this.$cookie.set("authId", response.body.id);
              this.$cookie.set("authToken", response.body.token);
              location.reload();

              // Pushing a route for the router object
              this.$router.push('/');
              $('#registerModal').modal('hide');

          }, function(error){
            this.error = error.statusText;
            this.errorFlag = true;
          });
        }, function(error) {
            this.error = error.statusText;
            this.errorFlag = true;
          });
        }
      },

      logoutUser: function() {
        this.$http.post('http://localhost:4941/api/v1/users/logout', {}, {
          headers: {
            'X-Authorization': this.$cookie.get('authToken')
          }
        })
          .then(function () {
            this.$cookie.delete('authId');
            this.$cookie.delete('authToken');
            location.reload();
            }, function (error) {
            this.error = error;
            this.errorFlag = true;
          });
      },

      loginUser: function () {
        this.$http.post('http://localhost:4941/api/v1/users/login', JSON.stringify({
          "username": this.username,
          "email": this.email,
          "password": this.password
        }), {
          headers: {
            'Content-Type': 'application/json'
          }}).then(function (response) {
          this.$cookie.set("authId", response.body.userId);
          this.$cookie.set("authToken", response.body.token);
          location.reload();
          // this.$store.commit('changeId', response.data.id);
        }, function (error) {
          this.error = error.statusText.slice(12);
          this.errorFlag = true;
        });
      },

      reset () {
        this.$refs.form.reset()
      },
    }
  }


</script>
