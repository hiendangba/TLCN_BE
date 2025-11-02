class CreateBuildingRequest {
  constructor(data) {
    this.name = data.name;
    this.genderRestriction = data.genderRestriction;
  }
}

module.exports = {CreateBuildingRequest};