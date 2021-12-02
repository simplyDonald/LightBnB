const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
  .query((`                                                                                                                                                                                                         
  SELECT * FROM users 
  WHERE email = $1 
  `), [email])
  .then(console.log((result) => result.rows[0]))
  .catch((err) => {
    console.log(err.message);
  });
};

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
  .query((`
  SELECT * FROM users 
  WHERE id = $1 
  `), [id])
  .then((result) => result.rows[0])
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
return pool
.query ((`
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
`), [user.name, user.email, user.password])
.then((result) => console.log(result.rows))
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
    return pool
      .query(`SELECT properties.*, reservations.*, AVG(rating) AS average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    AND reservations.end_date < NOW()::DATE
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;`, [guest_id, limit])
      .then((result) => {
        console.log("RESULTS-->", result.rows);
        return result.rows;
      })
      .catch((err) => {
        return (err.message);
      });
  };

exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
 const getAllProperties = (options, limit = 10) => {
    const queryParams = [];
    let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
    `;
    if (options.city) {
      queryParams.push(`%${options.city}%`);
      queryString += `WHERE city = $${queryParams.length} `;
    }
    if (options.owner_id) {
      queryParams.length > 1 ?  queryString += 'AND ' : queryString +='WHERE '
      queryParams.push(`${options.owner_id}`);
      queryString += `owner_id = $${queryParams.length} `;
    }
    if (options.minimum_price_per_night && options.max_price_per_night) {
      queryParams.push(`${options.minimum_price_per_night*100}`);
      queryParams.push(`${options.max_price_per_night*100}`);
      const min = queryParams.length -1
      const max =  queryParams.length
      queryParams.length > 1 ?  queryString += 'AND ' : queryString +='WHERE '
      queryString += `cost_per_night > $${min} AND cost_per_night < $${max} `;
    }
    if (options.minimum_rating) {
      queryParams.push(`${options.minimum_rating}`);
      queryParams.length > 1 ?  queryString += 'AND ' : queryString +='WHERE '
      queryString += `rating >= $${queryParams.length} `;
    }
    queryParams.push(limit);
    queryString += `
    GROUP BY properties.id
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;

    console.log(queryString, queryParams);
    return pool.query(queryString, queryParams).then((res) => res.rows);
  };
//   SELECT properties.*, avg(property_reviews.rating) as average_rating
// FROM properties
// JOIN property_reviews ON properties.id = property_id
// WHERE city LIKE $1
// GROUP BY properties.id
// HAVING avg(property_reviews.rating) >= 4
// ORDER BY cost_per_night
// LIMIT 10;

  
  
  // return pool
  //   .query(`SELECT * FROM properties LIMIT $1`, [limit])
  //   .then((result) => result.rows)
  //   .catch((err) => {
  //     console.log(err.message);
  //   });

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  return pool.query(
  `INSERT INTO properties (
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
  )
  VALUES (
    '${property.owner_id}', '${property.title}', '${property.description}', '${property.thumbnail_photo_url}', '${property.cover_photo_url}', '${property.cost_per_night}', '${property.street}', '${property.city}', '${property.province}', '${property.post_code}', '${property.country}', '${property.parking_spaces}', '${property.number_of_bathrooms}', '${property.number_of_bedrooms}')
  RETURNING *;
  `)
  .then(res => {
    return res.rows
  })
}

exports.addProperty = addProperty;