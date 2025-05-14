const data = require('../model/statesData.json');
const State = require('../model/State');

// Returns all of the state data
const getAllStates = async (req, res) =>{
    const states = await State.find();
    if(!states) return res.status(404).json({'message': 'No states found.'});
    
    const resultStates = [];

    if(req.query.contig != 'true')
    {
        let match = false;
        
        // Loop through all the state data
        for(let i = 0; i < data.length; i++)
        {
            if(req.query.contig === 'false')
            {
                if(data[i].code === "AK" || data[i].code === "HI")
                {
                    for(let j = 0; j < states.length; j++){
                        if(data[i].code === states[j].stateCode){
                            resultStates.push({...data[i], funfacts: states[j].funfacts});
                            match = true;
                        } 
                    }
                if(!match) 
                { // Check for duplicate "Fun Fact"
                    resultStates.push({...data[i]});
                }   
                match = false;
                }
            } else {
                for(let j = 0; j < states.length; j++)
                {
                    if(data[i].code === states[j].stateCode)
                    { 
                        resultStates.push({...data[i], funfacts: states[j].funfacts});
                        match = true;
                    } 
                } if(!match) {
                    resultStates.push({...data[i]});
                }   
                match = false;
            }
        }
    } else {
        let match = false;
        for(let i = 0; i < data.length; i++)
        {
            if(data[i].code !== "AK" && data[i].code !== "HI")
            {
                for(let j = 0; j < states.length; j++)
                {
                    if(data[i].code === states[j].stateCode)
                    {
                        resultStates.push({...data[i], funfacts: states[j].funfacts});
                        match = true;
                    } 
                }
                if(!match){resultStates.push({...data[i]});}   
                match = false;
            } 
        }
    }
    res.json(resultStates);
}

// Fun Fact Maker
const createNewFunfact = async (req, res) => {
    if(!req?.body?.funfacts || req?.body?.funfacts.length < 1) {
        return res.status(400).json({'message': 'State fun facts value required'});
    }

    if(!Array.isArray(req?.body?.funfacts)) {
        return res.status(400).json({'message': 'State fun facts value must be an array'});
    }

    const state = req.params.state.toLowerCase();

    if (
        state != "al" && state != "ak" && state != "az" && state != "ar" && state != "ca" 
        && state != "co" && state != "ct" && state != "de" && state != "fl" && state != "ga"
        && state != "hi" && state != "id" && state != "il" && state != "in" && state != "ia"
        && state != "ks" && state != "ky" && state != "la" && state != "me" && state != "md"
        && state != "ma" && state != "mi" && state != "mn" && state != "ms" && state != "mo"
        && state != "mt" && state != "ne" && state != "nv" && state != "nh" && state != "nj"
        && state != "nm" && state != "ny" && state != "nc" && state != "nd" && state != "oh"
        && state != "ok" && state != "or" && state != "pa" && state != "ri" && state != "sc"
        && state != "sd" && state != "tn" && state != "tx" && state != "ut" && state != "vt"
        && state != "va" && state != "wa" && state != "wv" && state != "wi" && state != "wy"
    ) {return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    }  else { 
        // Valid State Code
        const states = await State.find();
        let inDatabase = false;

        // Loop through all the state data
        for(let j = 0; j < states.length; j++)
        {
            if(req.params.state.toUpperCase() === states[j].stateCode)
            {
                inDatabase = true;      
                states[j].funfacts = states[j].funfacts.concat(req.body.funfacts); //Appends the new funfacts to the current funfacts.  
                const result = await states[j].save();
                return res.json(result);
            } 
        }
        // Add state to MongoDB
        if(!inDatabase)
        {
            const result = await State.create({
                stateCode: req.params.state.toUpperCase(),
                funfacts: req.body.funfacts
            });
            return res.status(201).json(result);
        }
    }
}

// Fun Fact Updater
const updateFunfact = async (req, res) => {

    // Check for index
    if(!req?.body?.index) {
        return res.status(400).json({'message': 'State fun fact index value required'});
    }

    // Check if string
    if(typeof req?.body?.funfact !== 'string') {
        return res.status(400).json({'message': 'State fun fact value required'});
    }

    const state = req.params.state.toLowerCase();

    if (
        state != "al" && state != "ak" && state != "az" && state != "ar" && state != "ca" 
        && state != "co" && state != "ct" && state != "de" && state != "fl" && state != "ga"
        && state != "hi" && state != "id" && state != "il" && state != "in" && state != "ia"
        && state != "ks" && state != "ky" && state != "la" && state != "me" && state != "md"
        && state != "ma" && state != "mi" && state != "mn" && state != "ms" && state != "mo"
        && state != "mt" && state != "ne" && state != "nv" && state != "nh" && state != "nj"
        && state != "nm" && state != "ny" && state != "nc" && state != "nd" && state != "oh"
        && state != "ok" && state != "or" && state != "pa" && state != "ri" && state != "sc"
        && state != "sd" && state != "tn" && state != "tx" && state != "ut" && state != "vt"
        && state != "va" && state != "wa" && state != "wv" && state != "wi" && state != "wy"
    ) {return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    } else {
        // Valid State Code
        const states = await State.find();

        for(let j = 0; j < states.length; j++)
        {
            if(req.params.state.toUpperCase() === states[j].stateCode.toUpperCase())
            {
                if(states[j].funfacts.length < 1)
                {
                    for(let i = 0; i < data.length; i++)
                    {
                        if(states[j].stateCode.toUpperCase() === data[i].code.toUpperCase())
                        {
                            return res.status(400).json({'message': `No Fun Facts found for ${data[i].state}`});
                        }
                    }  
                }

                // Updates states Fun Fact
                for(let e = 0; e < states[j].funfacts.length; e++)
                {
                    if((e + 1) === req?.body?.index)
                    {
                        states[j].funfacts[e] = req.body.funfact;
                        const result = await states[j].save();
                        return res.json(result);
                    }
                }

                for(let i = 0; i < data.length; i++)
                {
                    if(states[j].stateCode.toUpperCase() === data[i].code.toUpperCase())
                    {
                        return res.status(400).json({'message': `No Fun Fact found at that index for ${data[i].state}`});
                    }
                }   
            } 
        }

        for(let i = 0; i < data.length; i++)
        {
            if(req.params.state.toUpperCase() === data[i].code.toUpperCase())
            {
                return res.status(400).json({'message': `No Fun Facts found for ${data[i].state}`});
            }
        }  
    }
}

// Fun Fact Deleter
const deleteFunFact = async (req, res) => {
    if(!req?.body?.index) return res.status(400).json({'message': 'State fun fact index value required'});

    const state = req.params.state.toLowerCase();

    if (
        state != "al" && state != "ak" && state != "az" && state != "ar" && state != "ca" 
        && state != "co" && state != "ct" && state != "de" && state != "fl" && state != "ga"
        && state != "hi" && state != "id" && state != "il" && state != "in" && state != "ia"
        && state != "ks" && state != "ky" && state != "la" && state != "me" && state != "md"
        && state != "ma" && state != "mi" && state != "mn" && state != "ms" && state != "mo"
        && state != "mt" && state != "ne" && state != "nv" && state != "nh" && state != "nj"
        && state != "nm" && state != "ny" && state != "nc" && state != "nd" && state != "oh"
        && state != "ok" && state != "or" && state != "pa" && state != "ri" && state != "sc"
        && state != "sd" && state != "tn" && state != "tx" && state != "ut" && state != "vt"
        && state != "va" && state != "wa" && state != "wv" && state != "wi" && state != "wy"
    ) {return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    } else {
        // Valid State Code
        const states = await State.find(); 
        let funFactArray = [];

        for(let j = 0; j < states.length; j++)
        {
            if(req.params.state.toUpperCase() === states[j].stateCode.toUpperCase())
            {
                if(states[j].funfacts.length < 1)
                {
                    for(let i = 0; i < data.length; i++)
                    {
                        if(states[j].stateCode.toUpperCase() === data[i].code.toUpperCase()) 
                            return res.status(400).json({'message': `No Fun Facts found for ${data[i].state}`});
                    }  
                }
                let index = false;

                // Checks if state has Fun Fact then loop throughs through it
                for(let e = 0; e < states[j].funfacts.length; e++)
                {
                    if((e + 1) === req?.body?.index) {
                        index = true;
                    } else { 
                        funFactArray.push(states[j].funfacts[e]); //Pushes all funfacts that the user does NOT want to be deleted.
                    }
                }
                if(!index)
                {
                    for(let i = 0; i < data.length; i++)
                    {
                    if(states[j].stateCode.toUpperCase() === data[i].code.toUpperCase())
                        return res.status(400).json({'message': `No Fun Fact found at that index for ${data[i].state}`});
                    } 
                } else {
                    // State set to Fun Facts array
                    states[j].funfacts = funFactArray; 
                    const result = await states[j].save();
                    return res.json(result);
                }
            } 
        } 
        for(let i = 0; i < data.length; i++) {
            if(state.toUpperCase() === data[i].code.toUpperCase()) 
                return res.status(400).json({'message': `No Fun Facts found for ${data[i].state}`});
        }  
    }
}

const getState = async (req, res) => {
    
    if(!req?.params?.state) {
        return res.status(400).json({'message': 'State required'});
    } 

    const state = req.params.state.toLowerCase();

    if (
        state != "al" && state != "ak" && state != "az" && state != "ar" && state != "ca" 
        && state != "co" && state != "ct" && state != "de" && state != "fl" && state != "ga"
        && state != "hi" && state != "id" && state != "il" && state != "in" && state != "ia"
        && state != "ks" && state != "ky" && state != "la" && state != "me" && state != "md"
        && state != "ma" && state != "mi" && state != "mn" && state != "ms" && state != "mo"
        && state != "mt" && state != "ne" && state != "nv" && state != "nh" && state != "nj"
        && state != "nm" && state != "ny" && state != "nc" && state != "nd" && state != "oh"
        && state != "ok" && state != "or" && state != "pa" && state != "ri" && state != "sc"
        && state != "sd" && state != "tn" && state != "tx" && state != "ut" && state != "vt"
        && state != "va" && state != "wa" && state != "wv" && state != "wi" && state != "wy"
    ) {return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    } else {
        // Valid State Code
        const states = await State.find();
        if(!states) return res.status(204).json({'message': 'No states found.'});

        for(let i = 0; i < data.length; i++)
        {
            if(data[i].code.toLowerCase() == state)
            {
                
                for(let j = 0; j < states.length; j++)
                {
                    if(data[i].code === states[j].stateCode)
                    {
                        const resultState = {
                            ...data[i],
                            funfacts: states[j].funfacts
                        }
                        return res.json(resultState);
                    } 
                }
                const resultState = {
                    ...data[i]
                }
                return res.json(resultState);
            } 
        }
    }
}

// Get Fun Fact
const getFunfact = async (req, res) => {

    if(!req?.params?.state) {
        return res.status(400).json({'message': 'State required'});
    } 

    let state = req.params.state.toLowerCase();

    if (
        state != "al" && state != "ak" && state != "az" && state != "ar" && state != "ca" 
        && state != "co" && state != "ct" && state != "de" && state != "fl" && state != "ga"
        && state != "hi" && state != "id" && state != "il" && state != "in" && state != "ia"
        && state != "ks" && state != "ky" && state != "la" && state != "me" && state != "md"
        && state != "ma" && state != "mi" && state != "mn" && state != "ms" && state != "mo"
        && state != "mt" && state != "ne" && state != "nv" && state != "nh" && state != "nj"
        && state != "nm" && state != "ny" && state != "nc" && state != "nd" && state != "oh"
        && state != "ok" && state != "or" && state != "pa" && state != "ri" && state != "sc"
        && state != "sd" && state != "tn" && state != "tx" && state != "ut" && state != "vt"
        && state != "va" && state != "wa" && state != "wv" && state != "wi" && state != "wy"
    ) {return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    } else {
        // Valid State Code
        state = state.toUpperCase();
        const stateInfo = await State.findOne({stateCode: `${state}`});

        for(let i = 0; i < data.length; i++)
        {
            if(data[i].code == state)
            {
                if(stateInfo == null)
                {
                    return res.status(404).json({'message': `No Fun Facts found for ${data[i].state}`});
                } else if(data[i].code === stateInfo.stateCode) {
                    const randomIndex = Math.floor(Math.random() * stateInfo.funfacts.length);    
                    const randomFact = stateInfo.funfacts[randomIndex];
                    const resultState = {
                        funfact: randomFact
                    }
                    return res.json(resultState);
                }
            } 
        } 
    }
}

// Get State Capital
const getCapital = async (req, res) => {
    if(!req?.params?.state) {
        return res.status(400).json({'message': 'State required'});
    } 

    let state = req.params.state.toLowerCase();

    if (
        state != "al" && state != "ak" && state != "az" && state != "ar" && state != "ca" 
        && state != "co" && state != "ct" && state != "de" && state != "fl" && state != "ga"
        && state != "hi" && state != "id" && state != "il" && state != "in" && state != "ia"
        && state != "ks" && state != "ky" && state != "la" && state != "me" && state != "md"
        && state != "ma" && state != "mi" && state != "mn" && state != "ms" && state != "mo"
        && state != "mt" && state != "ne" && state != "nv" && state != "nh" && state != "nj"
        && state != "nm" && state != "ny" && state != "nc" && state != "nd" && state != "oh"
        && state != "ok" && state != "or" && state != "pa" && state != "ri" && state != "sc"
        && state != "sd" && state != "tn" && state != "tx" && state != "ut" && state != "vt"
        && state != "va" && state != "wa" && state != "wv" && state != "wi" && state != "wy"
    ) {return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    } else {
        // Valid State Code
        state = state.toUpperCase();
        
        for(let i = 0; i < data.length; i++)
        {
            if(data[i].code == state)
            {
                const resultState = {
                    state: data[i].state,
                    capital: data[i].capital_city
                }
                return res.json(resultState);
            } 
        } 
    }
}

// Nickname Getter
const getNickname = async (req, res) => {
    if(!req?.params?.state) {
        return res.status(400).json({'message': 'State required'});
    } 

    let state = req.params.state.toLowerCase();

    if 
    (
        state != "al" && state != "ak" && state != "az" && state != "ar" && state != "ca" 
        && state != "co" && state != "ct" && state != "de" && state != "fl" && state != "ga"
        && state != "hi" && state != "id" && state != "il" && state != "in" && state != "ia"
        && state != "ks" && state != "ky" && state != "la" && state != "me" && state != "md"
        && state != "ma" && state != "mi" && state != "mn" && state != "ms" && state != "mo"
        && state != "mt" && state != "ne" && state != "nv" && state != "nh" && state != "nj"
        && state != "nm" && state != "ny" && state != "nc" && state != "nd" && state != "oh"
        && state != "ok" && state != "or" && state != "pa" && state != "ri" && state != "sc"
        && state != "sd" && state != "tn" && state != "tx" && state != "ut" && state != "vt"
        && state != "va" && state != "wa" && state != "wv" && state != "wi" && state != "wy"
    ) {return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    } else {
        // Valid State Code
        state = state.toUpperCase();

        for(let i = 0; i < data.length; i++)
        {
            if(data[i].code == state)
            {
                const resultState = {
                    state: data[i].state,
                    nickname: data[i].nickname
                }
                return res.json(resultState);
            } 
        } 
    }
}

// Population Getter
const getPopulation = async (req, res) => {
    if(!req?.params?.state) {
        return res.status(400).json({'message': 'State required'});
    } 

    let state = req.params.state.toLowerCase();

   if (
        state != "al" && state != "ak" && state != "az" && state != "ar" && state != "ca" 
        && state != "co" && state != "ct" && state != "de" && state != "fl" && state != "ga"
        && state != "hi" && state != "id" && state != "il" && state != "in" && state != "ia"
        && state != "ks" && state != "ky" && state != "la" && state != "me" && state != "md"
        && state != "ma" && state != "mi" && state != "mn" && state != "ms" && state != "mo"
        && state != "mt" && state != "ne" && state != "nv" && state != "nh" && state != "nj"
        && state != "nm" && state != "ny" && state != "nc" && state != "nd" && state != "oh"
        && state != "ok" && state != "or" && state != "pa" && state != "ri" && state != "sc"
        && state != "sd" && state != "tn" && state != "tx" && state != "ut" && state != "vt"
        && state != "va" && state != "wa" && state != "wv" && state != "wi" && state != "wy"
    ) {return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    } else {
        // Valid State Code
        state = state.toUpperCase();

        for(let i = 0; i < data.length; i++)
        {
            if(data[i].code == state)
            {
                const resultState = {
                    state: data[i].state,
                    population: data[i].population.toLocaleString("en-US")
                }
                return res.json(resultState);
            } 
        } 
    }
}

// Admission Getter
const getAdmission = async (req, res) => {
    
    if(!req?.params?.state) {
        return res.status(400).json({'message': 'State required'});
    } 

    let state = req.params.state.toLowerCase();

    if (
        state != "al" && state != "ak" && state != "az" && state != "ar" && state != "ca" 
        && state != "co" && state != "ct" && state != "de" && state != "fl" && state != "ga"
        && state != "hi" && state != "id" && state != "il" && state != "in" && state != "ia"
        && state != "ks" && state != "ky" && state != "la" && state != "me" && state != "md"
        && state != "ma" && state != "mi" && state != "mn" && state != "ms" && state != "mo"
        && state != "mt" && state != "ne" && state != "nv" && state != "nh" && state != "nj"
        && state != "nm" && state != "ny" && state != "nc" && state != "nd" && state != "oh"
        && state != "ok" && state != "or" && state != "pa" && state != "ri" && state != "sc"
        && state != "sd" && state != "tn" && state != "tx" && state != "ut" && state != "vt"
        && state != "va" && state != "wa" && state != "wv" && state != "wi" && state != "wy"
    ) {return res.status(404).json({'message': 'Invalid state abbreviation parameter'});
    } else {
        // Valid State Code
        state = state.toUpperCase();

        for(let i = 0; i < data.length; i++)
        {
            if(data[i].code == state)
            {
                const resultState = {
                    state: data[i].state,
                    admitted: data[i].admission_date.toLocaleString("en-US")
                }
                return res.json(resultState);
            } 
        } 
    }
}

module.exports = {getAllStates, createNewFunfact, updateFunfact, deleteFunFact, getState, getFunfact, getCapital, getNickname, getPopulation, getAdmission}