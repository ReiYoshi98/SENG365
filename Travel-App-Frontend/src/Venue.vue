<template xmlns:text-align="http://www.w3.org/1999/xhtml">
  <div class="venue-page">
    <!-- Navigation bar -->
    <div v-if="$route.params.venueId" >
      <div id="venue" >
        <router-link :to="{ name: 'venues'}" class="back">Back to Venues</router-link>
        <div class="container">
          <div class="details">
            <br /><br />
            <table class="venueTable" style="width:100%; background-color: grey; color: white">
              <tr>
                <th>Venue Name</th>
                <td id="editName"><div contenteditable>{{(getSingleVenueByID($route.params.venueId)).venueName }}</div></td>
              </tr>
              <tr>
                <th>Category:</th>
                <td id="editCat">
                  <label>
                    <select id="categorySelect">
                      <option style="color: black">{{(getSingleVenueByID($route.params.venueId)).category.categoryName }}</option>
                      <option style="color: black" value="Accommodation">Accommodation</option>
                      <option style="color: black" value="Cafés & Restaurants">Cafés & Restaurants</option>
                      <option style="color: black" value="Attractions">Attractions</option>
                      <option style="color: black" value="Events">Events</option>
                      <option style="color: black" value="Nature Spots">Nature Spots</option>
                    </select>
                  </label>
                </td>
              </tr>
              <tr>
                <th>Admin:</th>
                <td>{{(getSingleVenueByID($route.params.venueId)).admin.username }}</td>
              </tr>
              <tr>
                <th>City:</th>
                <td id="editCity"><div contenteditable>{{(getSingleVenueByID($route.params.venueId)).city }}</div></td>
              </tr>
              <tr>
                <th>Address</th>
              <td id="editAddress"><div contenteditable>{{ (getSingleVenueByID($route.params.venueId)).address }}</div></td>
              </tr>
              <tr>
                <th>Date Added</th>
                <td>{{ (getSingleVenueByID($route.params.venueId)).dateAdded.slice(0, 10) }}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td id="editDescription"><div contenteditable><p>{{ (getSingleVenueByID($route.params.venueId)).shortDescription }}<span id="dots">...</span>
                  <span id="more"> {{  (getSingleVenueByID($route.params.venueId)).longDescription }}</span></p>
                  <button v-on:click=myFunction() id="myBtn">Read more</button></div></td>
              </tr>
              <tr>
                <th>Average star rating</th>
                <td>{{ (getSingleVenue($route.params.venueId)).meanStarRating }}</td>
              </tr>
              <tr>
                <th>Average cost</th>
                <td>${{ (getSingleVenue($route.params.venueId)).modeCostRating }}</td>
              </tr>
              <tr>
                <th>Click on boxes to edit</th>
                <td><v-btn v-on:click="editVenue()" color=light-green darken-2 type="submit">Apply Changes</v-btn></td>
              </tr>
            </table>
          </div>
          <div class="details" style="padding-top: 100px">
            <div>
            <!-- Check if the venue actually has photos -->
            <div v-if="(getSingleVenueByID($route.params.venueId).photos).length > 0">
              <div v-for="photo in (getSingleVenueByID($route.params.venueId).photos)">
                <div>
                  <v-img
                    :src="'http://localhost:4941/api/v1/venues/' + $route.params.venueId + '/photos/' + photo.photoFilename"
                    :lazy-src="'/images/Default.jpg'"
                    alt="No Photo"
                    height="300"
                    width="300"
                  >
                  </v-img>
                </div>
              </div>
            </div>
            <!-- If not -->
            <div v-else>
              <v-img
                :src="'/images/Default.jpg'"
                :lazy-src="'/images/Default.jpg'"
                alt="No Photo"
                height="300"
                width="300">
              </v-img>
            </div>
            </div>
            <v-alert v-if="errorFlag" color=amber darken-1 icon="warning" value="true">
              {{error}}
            </v-alert>
            <v-alert v-if="!errorFlag && venueUpdated" color="light-green darken-1" type="success" value="true">
              Venue has been changed!
            </v-alert>

            <div class="reviews">
              <table class="reviewTable" style="width:100%; background-color: #FF8000; color: white">
                <th>Reviews:</th>
                <td></td>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="main">
        <div class="container" id="selection">
          <div id="app" >
            <v-toolbar color="grey darken-1" dark>
              <v-toolbar-title>Filter</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field v-model="search"
                label="Search City"
                prepend-icon="search"
                single-line
              ></v-text-field>
              <v-text-field v-model="phrase"
                label="Search Phrase"
                prepend-icon="search"
                single-line
              ></v-text-field>
<!--
              <v-spacer></v-spacer>
              <select v-model="selectedCat" class="selectCat">
                <option v-for="cat in catOptions" >{{cat}}</option>
              </select>
              {{this.selectedCat}}
-->
              <v-spacer></v-spacer>
            </v-toolbar>
          </div>
        </div>
        <div class="text-xs-center">
          <v-dialog
            v-model="dialog"
            width="500"
          >
            <template v-slot:activator="{ on }">
              <v-btn
                color=light-green darken-1
                dark
                v-on="on"
              >
                Add Venue
              </v-btn>
            </template>
            <div v-if="this.$cookie.get('authToken')">
            <v-card>
              <v-card-title
                class="headline grey lighten-2"
                primary-title
              >
                Add Venue
              </v-card-title>
              <v-alert v-if="errorFlag" color=amber darken-1 icon="warning" value="true">
                {{error}}
              </v-alert>
              <v-form v-on:submit.prevent="addVenue()"
                      ref="form"
                      lazy-validation
              >
                <v-text-field
                  v-model="venueName"
                  :counter="10"
                  label="Venue name"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="venueCategory"
                  label="Category"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="shortDescription"
                  label="Short Description"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="longDescription"
                  label="Long Description"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="city"
                  label="City"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="address"
                  label="address"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="latitude"
                  label="Latidude"
                ></v-text-field>

                <v-text-field
                  v-model="longitude"
                  label="Longitude"
                ></v-text-field>

                <v-btn
                  color=light-green darken-2
                  type="submit"
                  @click="alert = !alert"
                >
                  Add
                </v-btn>

                <v-alert
                  :value="alert"
                  color="light-green darken-1"
                  type="success"
                  transition="scale-transition"
                >
                  Venue has been added. </v-alert>

              </v-form>
              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  flat
                  @click="dialog = false"
                >
                  close
                </v-btn>
              </v-card-actions>
            </v-card>
            </div>
            <div v-else>
              <v-alert
                :value="true"
                type="info"
                color="blue darken-3"
              >
                You must log in as a user to add a venue!
              </v-alert>
            </div>
          </v-dialog>
        </div>
        <div class="container" id="details">
            <div class="row" v-for="venue in filteredVenue" style="width: 100%">
              <div class="venue" id="venues">
                <div class="column">
                  <h1>{{venue.venueName}}</h1>
                  <p class="city">{{venue.city}}</p>
                  <p>{{venue.shortDescription}}</p>
                  <p>Mean star rating: {{venue.meanStarRating}}</p>
                  <p>Mode cost rating: {{venue.modeCostRating}}</p>
                  <!-- adding a category name for each venue by matching category ID-->
                  <p v-for="category in categories" v-if="venue.categoryId === category.categoryId">{{category.categoryName}}</p>
                </div>
                <div>
                  <v-img
                    :src="'http://localhost:4941/api/v1/venues/' + venue.venueId + '/photos/' + venue.primaryPhoto"
                    :lazy-src="'/images/Default.jpg'"
                    alt="No Photo"
                    height="200"
                    width="200">
                  <p>{{venue.venueName}} Image</p>
                  </v-img>
                </div>
                <router-link tag="button" class="collapsible" :to="{ name: 'venue', params: { venueId: venue.venueId}}">Read More
                </router-link>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>

</template>

<style scoped>

  .back {
  }

  .row
  {
    display: flex;
    -webkit-flex-wrap: wrap;
    width: 100%; /*Optional*/
    table-layout: fixed;
    padding-bottom: 30px;
  }

  .column {
    float: left;
    width: 50%;
  }

  /* Clear floats after the columns */
  .row:after {
    content: "";
    display: table;
    clear: both;
  }

  table {
    border-collapse: collapse;
  }

  th, td {
    padding: 10px;
  }

  div#venues {
    box-shadow: 0 16px 32px 0 rgba(0, 0, 0, 0.2);
    max-width: 600px;
    height: 300px;
    margin: auto;
    text-align: left;
    padding-left: 20px;
    padding-right: 20px;
    flex: 80px 1;
    background-color: #848484;
    border-style: solid;
    border-width: 2px;
    border-color: #FF8000;
  }

  #venues p, h1 {
    color: white;
  }

  p.city {
    color: grey;
    font-size: 16px;
  }

  .collapsible {
    border: none;
    outline: 0;
    display: inline-block;
    padding: 8px;
    color: white;
    background-color: #FF8000;
    text-align: center;
    cursor: pointer;
    width: 100%;
    font-size: 18px;
  }

  .collapsible:hover {
    background-color: #00B4CC;
  }

  body{
    font-family: 'Open Sans', sans-serif;
  }

  /* Column div used for venue details and images */
  .details {
    float: left;
    width: 40%;
    padding-left: 30px;
    padding-right: 30px;
  }


  /* Table with single venue details */
  .venueTable, th, td {
    border-style: solid;
    border-color: #00B4CC;
    border-width: 2px;
  }

  .reviews {
    padding-top: 50px;
  }

  th {
    text-align: left;
    width: 30%;
  }

  /* See more text */
  #more {
    display: none;
  }

</style>

<script>

  export default {
    data() {
      return {
        error: "",
        errorFlag: false,
        alert: false,
        venueAdded: false,
        venueUpdated: false,
        venues: [],
        venuesID: [],
        categories: [],
        search: '',
        phrase: '',
        catOptions: ["Accommodation", "Cafés & Restaurants", "Attractions", "Events", "Nature Spots"], // might not need this,
        selectedCat: 1,
        dialog: false,
        venueName: '',
        venueCategory: '',
        shortDescription: '',
        longDescription: '',
        city: '',
        address: '',
        latitude: '',
        longitude: ''
      }
    },
    mounted: function () {
      this.getVenues();
      this.getCategories();
    },
    methods: {
      // function to get venues from API server
      getVenues: function () {
        this.$http.get('http://localhost:4941/api/v1/venues')
          .then(function (response) {
            this.venues = response.data;
            this.getVenuesByID();
            console.log(this.venuesID)
          }, function (error) {
            this.error = error;
            this.errorFlag = true;
          });
      },

      /*
       * Iterates through the number of venues which exist and appends each venue into the list
       * get venues by ID request provides further information of the venue. Thus this function is used
       */
      getVenuesByID: function () {
        this.venuesID = [];
        for(let i = 1; i < this.venues.length+1; i++) {
          let url = 'http://localhost:4941/api/v1/venues/' + i;
          this.$http.get(url)
            .then(function (response) {
              this.venuesID.push(response.data);
            }, function (error) {
              this.error = error;
              this.errorFlag = true;
            })
        }
      },

      getSingleVenue: function(id){
        for(var i = 0; i < this.venues.length; i++){
          if (i === id-1){
            return this.venues[i];
          }
        }
      },

      /*
       * Gets the venue by id, the length of venuesID is how many venues exist in the data.
       */
      getSingleVenueByID: function(id){
        console.log(this.venuesID);
        console.log(id);
        for(var i = 0; i < this.venuesID.length; i++){
          if(i === id-1){
            console.log(this.venuesID[i].venueName);
            return this.venuesID[i];
          }
        }
      },

      // function to get categories from API server
      getCategories: function () {
        this.$http.get('http://localhost:4941/api/v1/categories')
          .then(function (response) {
            this.categories = response.data;
          }, function (error) {
            this.error = error;
            this.errorFlag = true;
          });
      },

      getCategoryID: function(name) {
        for (var i = 0; i < this.categories.length; i++){
          if(name.toLowerCase() === (this.categories[i].categoryName).toLowerCase()){
            return this.categories[i].categoryId;
          }
        }
      },

/*      filterVenue: function() {
        let params = {
          params: {
            categoryId: this.selectedCat
          }
        };
        console.log(params);
        this.$http.get('http://localhost:4941/api/v1/venues?', params)
          .then(function (response) {
            this.venues = response.data;
          }, function (error) {
            this.error = error;
            this.errorFlag = true;
          })
      },*/

      addVenue: function() {
        this.$http.post('http://localhost:4941/api/v1/venues/', JSON.stringify({
          "venueName": this.venueName,
          "categoryId": 1,
          "city": this.city,
          "shortDescription": this.shortDescription,
          "longDescription": this.longDescription,
          "address": this.address,
          "latitude": parseInt(this.latitude),
          "longitude": parseInt(this.longitude)
        }), {
          headers: {
            'Content-Type': 'application/json',
            'X-Authorization': this.$cookie.get('authToken')
          }
        }).then(function (response) {
          console.log(response.statusText);
          this.venueAdded = true;
          location.reload();
        }, function(error) {
          this.error = error.statusText;
          this.errorFlag = true;
        })
      },

      editVenue: function() {
        var name = document.getElementById('editName').innerText;
        let select = document.getElementById('categorySelect');
        var categoryName = select.options[select.selectedIndex].text;
        console.log(categoryName);
        let categoryId = this.getCategoryID(categoryName);
        console.log(categoryId);
        let city = document.getElementById('editCity').innerText;
        let address = document.getElementById('editAddress').innerText;
        let description = document.getElementById('editDescription').innerText;

        this.$http.patch('http://localhost:4941/api/v1/venues/' + this.$route.params.venueId, JSON.stringify({
          "venueName": name,
          "categoryId": categoryId,
          "city": city,
          "address": address,
          "description": description
        }), {
          headers: {
            'Content-Type': 'application/json',
            'X-Authorization': this.$cookie.get('authToken')
          }
        }).then(function (response) {
          console.log(response.statusText);
          this.venueUpdated = true;
        }, function (error) {
          this.error = error.statusText;
          this.errorFlag = true;
        })
      },

      myFunction() {
        var dots = document.getElementById("dots");
        var moreText = document.getElementById("more");
        var btnText = document.getElementById("myBtn");

        if (dots.style.display === "none") {
          dots.style.display = "inline";
          btnText.innerHTML = "Read more";
          moreText.style.display = "none";
        } else {
          dots.style.display = "none";
          btnText.innerHTML = "Read less";
          moreText.style.display = "inline";
        }
      }
    },

    computed: {
      // filter function for the venue to match the search inputs
      filteredVenue: function () {
        return this.venues.filter((venue) => {
          return venue.city.toLowerCase().match(this.search.toLowerCase()) &&
            venue.venueName.toLowerCase().match(this.phrase.toLowerCase());
        });
      }
    }
  }

</script>
