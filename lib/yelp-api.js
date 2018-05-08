const axios = require("axios");
require("../config/config");

// REQUIRED: name, city, state, country
const search_business_by_match = async (
  name,
  address1,
  city,
  state,
  zip_code,
  country,
  latitude,
  longitude
) => {
  const config = {
    headers: { Authorization: `Bearer ${process.env["API_KEY"]}` },
    params: {
      name: `${name}`,
      address1: `${address1}`,
      city: `${city}`,
      state: `${state}`,
      zip_code: `${zip_code}`,
      country: `${country}`,
      latitude: `${latitude}`,
      longitude: `${longitude}`
    }
  };

  const response = await axios.get(
    `https://api.yelp.com/v3/businesses/matches`,
    config
  );

  const businesses = JSON.parse(JSON.stringify(response.data));
  return businesses;
};

// REQUIRED: yelp_id
const search_business_by_id = async yelp_id => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${process.env["API_KEY"]}` }
    };
    const response = await axios.get(
      `https://api.yelp.com/v3/businesses/${yelp_id}`,
      config
    );
    const business = JSON.parse(JSON.stringify(response.data));
    return business;
  } catch (e) {
    throw new Error("Unable to get answer from YELP.");
  }
};

const search_new_businesses = async (categories, location) => {
  const config = {
    headers: { Authorization: `Bearer ${process.env["API_KEY"]}` },
    params: {
      categories: `${categories}`,
      location: `${location}`,
      attributes: `hot_and_new`
    }
  };

  const response = await axios.get(
    `https://api.yelp.com/v3/businesses/search`,
    config
  );

  const businesses = JSON.parse(JSON.stringify(response.data));
  return businesses;
};

module.exports = {
  search_business_by_match,
  search_business_by_id,
  search_new_businesses
};
