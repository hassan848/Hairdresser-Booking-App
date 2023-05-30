class QueryBlueprint {
  constructor(actualQuery, stringQuery) {
    this.actualQuery = actualQuery;
    this.stringQuery = stringQuery;
    // this.radiusSettings = {};
  }

  filter() {
    const queryObject = { ...this.stringQuery };
    // console.log(queryObject);

    // Converting queries to mongoDB queries
    let strQuery = JSON.stringify(queryObject);

    // for (const key in queryObject) {
    //   if (!(queryObject[key] instanceof Object)) continue;
    //   //   console.log(!(queryObject[key] instanceof Object));
    //   for (const operation in queryObject[key]) {
    //     // queryObject[key] = `$${operation}`;
    //     queryObject[key][`$${operation}`] = +queryObject[key][operation]
    //       ? +queryObject[key][operation]
    //       : queryObject[key][operation];
    //     delete queryObject[key][operation];
    //     // console.log(queryObject[key]);
    //   }
    // }

    // console.log(queryObject);

    strQuery = strQuery.replace(
      /\b(lte|lt|eq|ne|gte|gt)\b/g,
      (operation) => `$${operation}`
    );

    // console.log(JSON.parse(strQuery));
    this.actualQuery = this.actualQuery.find(JSON.parse(strQuery));
    this.stringQuery = JSON.parse(strQuery);
    if (this.stringQuery.lat) {
      // this.radiusSettings.lat = this.stringQuery.lat;
      // this.radiusSettings.lng = this.stringQuery.lng;
      // this.radiusSettings.proximity = this.stringQuery.proximity;
      delete this.stringQuery.lat;
      delete this.stringQuery.lng;
      delete this.stringQuery.proximity;
    }
    // this.stringQuery = queryObject;
    // console.log(this.stringQuery);

    for (const operation in this.stringQuery) {
      if (!(this.stringQuery[operation] instanceof Object)) continue;
      for (const second in this.stringQuery[operation]) {
        this.stringQuery[operation][second] = +this.stringQuery[operation][
          second
        ]
          ? +this.stringQuery[operation][second]
          : this.stringQuery[operation][second];
      }
    }
    // this.stringQuery[0] = stringQuery.parse(this.stringQuery[0]);
    // console.log(this.stringQuery);
    // console.log(queryObject);
    return this;
  }
}

module.exports = QueryBlueprint;
