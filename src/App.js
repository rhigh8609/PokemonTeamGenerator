import React, { useState, useEffect, useCallback } from 'react';
import { title, question } from './assets';
import './App.css';

// Custom hook to fetch and store all Pokémon names
const useFetchAllPokemon = () => {
    const [allPokemon, setAllPokemon] = useState([]);

    useEffect(() => {
        fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0')
            .then(res => res.json())
            .then(result => {
                // Sort the Pokémon names and store them in state and localStorage
                const sortedPokemon = result.results.map(p => p.name).sort();
                setAllPokemon(sortedPokemon);
                localStorage.setItem('allPokemon', JSON.stringify(sortedPokemon));
            })
            .catch(error => console.error('error', error));
    }, []);

    return allPokemon;
};

// Component to display each Pokémon card
const PokemonCard = ({ pokemon, imageUrl, index }) => (
    <div key={index} className='pokemonCard flex flex-col items-center bg-white rounded-2xl drop-shadow-md hoverBiggen'>
        <div className='bg-red-500 w-full flex text-center justify-center text-white rounded-t-2xl'>
            <h2 className='px-2'>{pokemon}</h2>
        </div>
        <img className='p-2 drop-shadow-xl' src={imageUrl} alt='pokemon' />
        <p className=''></p>
    </div>
);

const App = () => {
    // State to store all Pokémon names, the user's Pokémon team, the input, and the team images
    const allPokemon = useFetchAllPokemon();
    const [pokemonTeam, setPokemonTeam] = useState([]);
    const [input, setInput] = useState('');
    const [teamImages, setTeamImages] = useState(Array(6).fill(question));

    // Handler for input change event
    const handleInputChange = useCallback((e) => setInput(e.target.value), []);

    // Function to validate the input
    const validateInput = useCallback(() => {
        if (input === "") {
            alert("Enter a name");
            return false;
        }
        if (!/^[a-zA-Z\s]*$/g.test(input)) {
            alert("Invalid characters. Your name input should only have spaces and letters.");
            return false;
        }
        if (input.length < 6) {
            alert("Name is too short. Need a minimum of six letters");
            return false;
        }
        return true;
    }, [input]);

    // Function to convert user input into an array of letters
    const convertUserInput = useCallback((input) => {
        return input.split(' ').join('').toLowerCase().slice(0, 6).split('');
    }, []);

    // Function to capitalize the first letter of a string
    const capitalizeFirstLetter = useCallback((string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }, []);

    // Function to fetch images for the Pokémon team
    const fetchPokemonImages = useCallback(async (team) => {
        const imageUrls = await Promise.all(team.map(async pokemon => {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`);
            const result = await response.json();
            return result.sprites.front_default;
        }));
        setTeamImages(imageUrls);
    }, []);

    // Function to create a Pokémon team from the user's input
    const makeTeamFromName = useCallback(() => {
        const convertedInput = convertUserInput(input);
        const team = convertedInput.map(letter => {
            const filteredPokemon = allPokemon.filter(p => p[0] === letter);
            const randomPokemon = filteredPokemon[Math.floor(Math.random() * filteredPokemon.length)];
            return capitalizeFirstLetter(randomPokemon);
        });
        setPokemonTeam(team);
        fetchPokemonImages(team);
    }, [allPokemon, input, convertUserInput, capitalizeFirstLetter, fetchPokemonImages]);

    // Handler for the button click event
    const handleClick = useCallback(() => {
        if (validateInput()) makeTeamFromName();
    }, [validateInput, makeTeamFromName]);

    return (
        <div id='pageContainer' className="flex flex-col items-center mt-6">
            {/* Title image */}
            <div>
                <img src={title} alt="title" />
            </div>

            {/* Input name */}
            <div className='flex flex-col justify-center align-center p-4 bg-red-500 mt-12 rounded-xl'>
                <div id='nameForm' className='flex flex-col justify-center align-center bg-red-500' onSubmit={(e) => e.preventDefault()}>
                    <label className='bg-red-500 text-white'>Enter your name:</label>
                    <input
                        id='nameInput'
                        type='text'
                        value={input}
                        onChange={handleInputChange}
                        className='bg-white input[type=text] rounded-md border-gray-300 shadow-sm pl-3 py-2 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                    />
                </div>
            </div>

            {/* Button to create Pokémon team */}
            <button className='makeTeam bg-red-500 drop-shadow-xl hoverBiggen' onClick={handleClick}>
                Make Team
            </button>

            {/* Display Pokémon cards */}
            <div id='pokemonWrapper' className='grid grid-cols-3 m-6 gap-6'>
                {pokemonTeam.map((pokemon, index) => (
                    <PokemonCard key={index} pokemon={pokemon} imageUrl={teamImages[index]} index={index} />
                ))}
            </div>
        </div>
    );
};

export default App;
