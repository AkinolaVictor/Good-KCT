
    
function baseUrl(path){
    const production = `https://concealed-server.vercel.app/api/${path}`
    const production_dev = `https://concealed-server-dev.vercel.app/api/${path}`
    const local_dev = `http://localhost:5234/api/${path}`
    // const local_dev = `http://localhost:5233/api/${path}`

    if(process.env.CONCEALED_ENV==='production'){
        return production
    }else if(process.env.CONCEALED_ENV==='production-development'){
        return production_dev
    } else if(process.env.CONCEALED_ENV==='local-development'){
        return local_dev
    } else {
        return production_dev
    }

    // return production

    // return production_dev
    // return local_dev
}

module.exports = baseUrl