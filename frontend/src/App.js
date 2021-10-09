import React, { useState,useEffect,useRef} from 'react'
import axios from 'axios'
import "./App.css"

function App() {
  const [selectedFile, setSelectedFile] = useState()
  const [isFilePicked, setIsFilePicked] = useState(false)
  const [rs,setRs] = useState(null)
  const [links,setlinks] = useState(null)
  const [start,setStart] = useState(0)
  const [slice,setSlice]= useState(null)
  const [check,setCheck]= useState(true)
  let prev = usePrevious(start)
  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0])
    setIsFilePicked(true)
  }
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    }, [value]); 
    return ref.current;
  }

  useEffect(()=>
  { axios(`http://localhost:4000/link`).then(res=>{
    console.log(res)
    setlinks(res.data)
    setSlice(res.data.slice(0,5))
  }).catch(err=>console.log(err));
  
  },[rs])

  useEffect(()=>{
    
    
    if(start>prev){
      
      if(start+5>=links.length){
       setCheck(false)
       
        setSlice(links.slice(start,links.length))
      }
      else{
   
        setSlice(links.slice(start,start+5))
      
      }
    }
    else if(start<prev){
      setCheck(true)
      console.log("Hi",start,prev)
      if(start<=0){
        setSlice(links.slice(0,5))
      }
      else{
        setSlice(links.slice(start,prev))
      }
    }
  },[start])


  const handleSubmission = (e) => {
    e.preventDefault()
    const body = new FormData()
    body.append('file', selectedFile)
    axios
      .post('http://localhost:4000/upload', body)
      .then((res) => {
        setRs(res)
      })
      .catch((err) => alert(err.response.data.message))
     console.log(links)
  }
  const handlePrev=()=>{
    if(start>0){
      setStart(start-5)
    }
    if(start<0){
      setStart(0)
    }
  }
  const handleNext=()=>{
    
    setStart(start+5)

  }

  return (<div className="all">
     <h1>ATTAINU TEST</h1>
    <div className="App">
      <div className="shbtn">
      <input type='file' name='file' onChange={changeHandler} className="btntn"/>
      {isFilePicked ? (
        <div>
          <p>Filename: {selectedFile.name}</p>
          <p>Filetype: {selectedFile.type}</p>
          <p>Size in bytes: {selectedFile.size}</p>
          <p>
            lastModifiedDate:{' '}
            {selectedFile.lastModifiedDate.toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p>Select a file to show details</p>
      )}
      <div className="shbtn">
        <button onClick={handleSubmission} className="btntn">Submit</button>
      </div>
      </div>
      <div>
        <h2>
          Links
        </h2>
        {slice?<div className="linkcss">{slice.map(link=><a href={link.link} target="_blank" className="link" key={link.id}>Videolink-{link.id}</a>)}</div>:<p></p>}
      </div>
      <div className="btnflex">
        {start!==0?<button className="btntn" onClick={handlePrev}>Prev</button>:""}
        {check?<button className="btntn" onClick={handleNext}>Next</button>:''}
      
      </div>
    </div>
    </div>
  )
}

export default App
