import dotenv from 'dotenv'

const setconfig = (e)=>{
    if(e){
        console.log(e);
    }
    else{
        dotenv.config();
    }
}

export default setconfig;