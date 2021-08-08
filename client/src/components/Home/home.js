import React from "react";
import axios from "axios";
import "./home.css";

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      continents: [],
      contries: [],
      countryObject: {},
      finalImage: null,
      displayData: {},
    };

    this.submitCountry = this.submitCountry.bind(this);
  }

  componentWillMount() {
    this.getCountries();
    this.getContinents();
  }

  getCountries = async () => {
    axios
      .get("http://localhost:8080/countries")
      .then((response) => {
        if (typeof response.data.data !== "undefined") {
          let data = response.data.data;
          this.setState({ contries: data });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getContinents = async () => {
    axios
      .get("http://localhost:8080/countries/getContinents")
      .then((response) => {
        if (typeof response.data.data !== "undefined") {
          let data = response.data.data;
          this.setState({ continents: data });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleInputChange = (type, evt) => {
    if (type == "continent" && evt.target.value == "Select") {
      return false;
    }
    let countryObject = this.state.countryObject;
    countryObject[type] = evt.target.value;
    this.setState({ countryObject });
  };

  handleCountryChange = (evt) => {
    if (evt.target.value == "Select") {
      this.setState({ displayData: {} });
      return false;
    }
    let countryName = evt.target.value;
    axios
      .get("http://localhost:8080/countries/" + countryName)
      .then((response) => {
        if (typeof response.data.data !== "undefined") {
          let data = response.data.data;
          this.setState({ displayData: data });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  onFileChange = async (event) => {
    let countryObject = this.state.countryObject;
    countryObject["selectedFile"] = event.target.files[0];
    let finalImage = await this.convertBase64(event.target.files[0]);
    this.setState({ countryObject: countryObject, finalImage: finalImage });
  };

  convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  isValid = () => {
    let isValid = true;
    let requiredFields = ["countryName", "rank", "continent", "selectedFile"];
    let countryObject = this.state.countryObject;

    requiredFields.map((value) => {
      if (
        typeof countryObject[value] === "undefined" ||
        countryObject[value] == "" ||
        countryObject[value] == null
      ) {
        isValid = false;
        return false;
      }
    });

    if (!isValid) {
      alert("All fields are required");
    }
    if (
      typeof countryObject["countryName"] !== "undefined" &&
      (countryObject["countryName"].length < 3 ||
        countryObject["countryName"].length > 20)
    ) {
      isValid = false;
      alert("Country Name Min 3 chars and Max 20");
    }

    return isValid;
  };

  submitCountry() {
    let isValid = this.isValid();
    if (!isValid) {
      return false;
    }
    let data = {
      file: this.state.countryObject.selectedFile.name,
      fileString: this.state.finalImage,
      countryName: this.state.countryObject.countryName,
      rank: this.state.countryObject.rank,
      continent: this.state.countryObject.continent,
    };

    axios
      .post("http://localhost:8080/countries", data)
      .then((response) => {
        if (typeof response.data.data !== "undefined" && response.data.status) {
          let contries = this.state.contries;
          contries.push(response.data.data);
          this.setState({ countryObject: {}, finalImage: null, contries });
          document.getElementById("imageUpload").value = "";
        } else if (
          !response.data.status &&
          typeof response.data.error !== "undefined"
        ) {
          alert(response.data.error);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <div className="container">
        <div className="homeMain">
          <div className="viewSection">
            <div className="row">
              <div className="col-sm-3"></div>
              <div className="col-sm-6">
                <div className="viewMain">
                  <div className="title">
                    <h5>Country Application</h5>
                  </div>
                  <div className="viewData">
                    <div class="form-group">
                      <label for="continent">Country:</label>
                      <select
                        class="form-control"
                        id="countryName"
                        onChange={(e) => {
                          this.handleCountryChange(e);
                        }}
                      >
                        <option>Select</option>
                        {this.state.contries.map((value, index) => {
                          return <option>{value.name}</option>;
                        })}
                      </select>
                    </div>
                    {typeof this.state.displayData.name !== "undefined" ? (
                      <div className="data">
                        <div class="form-group">
                          <label>Name:</label>
                          <div>{this.state.displayData.name}</div>
                        </div>
                        <div class="form-group">
                          <label>Image:</label>
                          <div>
                            <img
                              src={
                                "http://localhost:8080/images/" +
                                this.state.displayData.flag
                              }
                            />
                          </div>
                        </div>
                        <div class="form-group">
                          <label>Continent:</label>
                          <div>{this.state.displayData.continent}</div>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
              <div className="col-sm-3"></div>
            </div>
          </div>
          <div className="addSection">
            <div className="row">
              <div className="col-sm-3"></div>
              <div className="col-sm-6">
                <div className="addFormMain">
                  <div className="title">
                    <h5>Add Country</h5>
                  </div>
                  <div className="addForm">
                    <form>
                      <div className="form-group">
                        <label htmlFor="countryName">Country Name:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={this.state.countryObject.countryName || ""}
                          onChange={(e) => {
                            this.handleInputChange("countryName", e);
                          }}
                          id="countryName"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="rank">Rank:</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          value={this.state.countryObject.rank || ""}
                          onChange={(e) => {
                            this.handleInputChange("rank", e);
                          }}
                          id="rank"
                        />
                      </div>
                      <div class="form-group">
                        <label for="continent">Continent:</label>
                        <select
                          class="form-control"
                          id="continent"
                          value={this.state.countryObject.continent || "Select"}
                          onChange={(e) => {
                            this.handleInputChange("continent", e);
                          }}
                        >
                          <option value="Select">Select</option>
                          {this.state.continents.map((value, index) => {
                            return <option>{value}</option>;
                          })}
                        </select>
                      </div>
                      <div class="form-group">
                        <label for="sel1">Upload Image:</label>
                        <div>
                          <input
                            type="file"
                            id="imageUpload"
                            name="filename"
                            accept="image/png, image/gif, image/jpeg"
                            onChange={this.onFileChange}
                            className="uploadBtn"
                          ></input>
                        </div>
                      </div>
                      <div className="submitBtn">
                        <button
                          type="button"
                          className="btn btn-default btn-primary"
                          onClick={this.submitCountry}
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-sm-3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
