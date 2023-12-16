"use strict"
import express from 'express';
import authenticateToken from '../jobs/authenticateToken.js';
// import defaultPermissions from '../constants/defaultPermissions.js';
// import query from '../utils/db_connection.js';
import MovieService from '../modules/MovieService.mjs';
import MovieRatingService from '../modules/MovieRatingService.mjs';
import UserService from '../modules/UserService.mjs';
import {
    ranItemInArray
} from '../utils/random_value_generators.js';

const moviesRouter = express.Router();

moviesRouter.use(authenticateToken);

const helper = new MovieService();
const ratingHelper = new MovieRatingService();
const userHelper = new UserService();


// fetch all movies
moviesRouter.get('/', async (req, res) => {

    // TODO: pagination

    const allMovies = await helper.fetch_by_criteria({});

    if (allMovies.success) {
        return res.status(200).json({
            data: allMovies.details,
        })
    } else {
        return res.status(422).json({
            message: `Sorry, failed to fetch your movies :(`
        })
    }
});

// fetch recommendations for user
moviesRouter.get('/recommendations', async (req, res) => {

    const allUsers = await userHelper.fetch_by_criteria({});
    const allMovies = await helper.fetch_by_criteria({});
    const allRatings = await ratingHelper.fetch_by_criteria({});

    const ratingMatrix = constructMoviesMatrix(allUsers.details, allMovies.details, allRatings.details, req.user.id);


    const requestedUsersRatings = [];

    allMovies.details.forEach(movie => {
        const ratingFound = allRatings.details.find(rating => rating.movie_id === movie.movie_id && rating.user_id === req.user.id);

        requestedUsersRatings.push(ratingFound?.value || null);
    });


    const recommendations = recommendMovies(requestedUsersRatings, ratingMatrix, allMovies.details);

    return res.status(200).json({
        recommendations
    });
});

// fetch the data of a single movie
moviesRouter.get('/:movie_id', async (req, res) => {

    const requestedMovie = await helper.fetch_by_id(req.params.movie_id);

    if (requestedMovie) return res.status(200).json(requestedMovie);

    return res.status(404).json({
        message: `Requested resource does not exist.`
    });
});

// fetch recommendations for user
// moviesRouter.post('/dummy-data', async (req, res) => {

//     const allUsers = await userHelper.fetch_by_criteria({});

//     let count = 80;

//     for (let i = 0; i < count; i++) {
//         const randomUser = ranItemInArray(allUsers.details)?.user_id;
//         const randomMovieId = ranItemInArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
//         const randomRatingValue = ranItemInArray([1, 2, 3, 4, 5]);

//         ratingHelper.create_single({
//             movie_id: randomMovieId,
//             value: randomRatingValue,
//             user_id: randomUser
//         });
//     };

//     return res.status(202).json({
//         message: `Accepted. hang on.`
//     });
// });

// create a new rating
moviesRouter.post('/:movie_id', async (req, res) => {

    const requestedMovie = await helper.fetch_by_id(req.params.movie_id);

    if (!requestedMovie) return res.status(404).json({
        message: `Requested resource does not exist.`
    });

    if (![1, 2, 3, 4, 5].includes(req.body.rating)) return res.status(400).json({
        message: `Invalid rating provided. Expected 1-5, received ${req.body.rating}`,
    });

    const ratingCreation = await ratingHelper.create_single({
        user_id: req.user.id,
        movie_id: requestedMovie.movie_id,
        value: req.body.rating,
    });

    if (!ratingCreation.success) return res.status(422).json({
        message: `Sorry, failed to create your rating :(`
    });

    return res.status(200).json(ratingCreation.details);
});




export default moviesRouter;






// Sample data representing movies and user ratings
const movies = {
    'Movie1': [5, 4, 0, 3, 0], // Ratings by users [User1, User2, User3, User4, User5]
    'Movie2': [4, 3, 0, 4, 0],
    'Movie3': [0, 5, 4, 0, 2],
    'Movie4': [3, 0, 5, 2, 4],
    // ... add more movies and ratings as needed
};

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((acc, rating, index) => acc + rating * vec2[index], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((acc, rating) => acc + rating ** 2, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((acc, rating) => acc + rating ** 2, 0));

    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0; // Avoid division by zero
    }

    return dotProduct / (magnitude1 * magnitude2);
}

// Function to recommend movies based on user ratings
function recommendMovies(userRatings, ratingMatrix, allMovies) {
    const similarMovies = [];

    for (const movie in ratingMatrix) {
        const similarity = cosineSimilarity(userRatings, ratingMatrix[movie]);
        similarMovies.push({
            movie: allMovies.find(mov => mov.movie_id === parseInt(movie)),
            similarity: parseFloat((similarity * 100).toFixed(3)),
        });
    }

    // Sort movies by similarity in descending order
    similarMovies.sort((a, b) => b.similarity - a.similarity);

    return similarMovies;
}

function constructMoviesMatrix(users, movies, ratings) {
    // Initialize an empty object to store ratings by movie
    const userItemMatrix = {};

    movies.forEach(movie => {

        userItemMatrix[movie.movie_id] = [];

        users.forEach(user => {
            const foundRating = ratings.find(rating => rating.movie_id === movie.movie_id && rating.user_id === user.user_id);

            userItemMatrix[movie.movie_id].push(foundRating?.value || null);
        });
    });

    return userItemMatrix;
}