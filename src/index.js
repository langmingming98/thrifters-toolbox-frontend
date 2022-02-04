import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { getDatabase, ref, push, set, query, orderByChild, limitToLast, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBaVzL0YDI_a1u52THb5DdSOf4sFY2R6NY",
    authDomain: "thrifter-s-toolbox.firebaseapp.com",
    databaseURL: "https://thrifter-s-toolbox-default-rtdb.firebaseio.com/",
    projectId: "thrifter-s-toolbox",
    storageBucket: "thrifter-s-toolbox.appspot.com",
    messagingSenderId: "736571499070",
    appId: "1:736571499070:web:d91e055cde9c7fbf7c676f",
    measurementId: "G-G4175ZNWYR"
  };
initializeApp(firebaseConfig);
const database = getDatabase();
const auth = getAuth();



function App() {
    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <Link to="/" key="search" className="navbar-brand">Pricing</Link>
                    <Link to="/trends" key="trending" className="nav-link">Trending</Link>
                    {/* <div className="collapse navbar-collapse">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                
                            </li>
                        </ul>
                    </div> */}
                </div>
            </nav>
            <div className="container">
                <div><p>Search any item you want to buy second hand and see the actual sell price of it on Poshmark and Mercari :)</p></div>
                <Outlet />
            </div>
        </div>
    )
}


function postKeyword(keyword) {
    const postListRef = ref(database, 'search_record');
    const newPostRef = push(postListRef);
    set(newPostRef, {
        keyword : cleanKeyword(keyword)
    });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const axios = require('axios');

function cleanKeyword(keyword) {
    return keyword.toLowerCase().replaceAll("[^A-Za-z0-9\s]","");
}

function getSearchData() {
    return new Promise(resolve => {
        const searchData = query(ref(database, 'search_record'), limitToLast(100));
        let searchRecord = [];
        onValue(searchData, snapshot => {
            snapshot.forEach((child) => {
                const key = child.key;
                const value = child.val();
                searchRecord.push(value)
                // console.log(key, value);
            })
            resolve(searchRecord)
        }, {
            onlyOnce: true
        })
    })
}

// async function Trends() {
    
//     // console.log(results)
//     // console.log(searchData_)
//     // const searchData = await searchData_.once('value')
//     // console.log(searchData);
//     let searchData = await getSearchData();
//     let searchRecord = []
//     searchData.map((item) => (searchRecord.push(item['keyword'])));

    
// }

//Anurag https://stackoverflow.com/a/3579651
function sortByFrequency(array) {
    var frequency = {};

    array.forEach(function(value) { frequency[value] = 0; });

    var uniques = array.filter(function(value) {
        return ++frequency[value] == 1;
    });

    return uniques.sort(function(a, b) {
        return frequency[b] - frequency[a];
    });
}

class Trends extends Component {
    constructor() {
        super();
        this.state = { searchRecord: [] }
    }

    componentDidMount() {
        getSearchData().then(res => this.setState({ searchRecord: res.map(it => it.keyword) }))
    }

    render() {
        return (
            <ul className="list-group">
                {sortByFrequency(this.state.searchRecord).map((item) => <li className="list-group-item" key={item}>{item}</li>)}
            </ul> 
        )
    }
}

class Search extends Component {

    constructor(props) {
        super(props);
        this.state = {keyword : '', results : ''};
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({keyword : event.target.value});
    }

    async handleClick() {
        let keyword = this.state.keyword;
        const { data } = await axios.get('https://infinite-fortress-72552.herokuapp.com/api', {params: { search: keyword }});
        // console.log(data);
        let searchResult = 'Your search for '+keyword+' is successful. '+keyword+' on average sells for $'+data['poshmark_price']+' on Poshmark and $'+data['mercari_price']+' on Mercari.';
        this.setState({results : searchResult});
        postKeyword(keyword);
    }

    render() {
        return (
            <div>
                {/* <Link to="/trends" key="trends_link">Trends</Link> */}
                <div className="input-group mb-3">
                    <input type="text" className="form-control" placeholder="try Levi's Jeans" onChange={this.handleChange}></input>
                    <button className="btn btn-outline-secondary" type="button" onClick={this.handleClick}>Search</button>
                </div>
                <div>
                    <h3>Search Results:</h3>
                    <p>{this.state.results}</p>
                </div>
            </div>
            
            
        )
    }
}   

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" key="top" element={<App />}>
                <Route path="/" key="search" element={<Search />} />
                <Route path="trends" key="trends" element={<Trends />} />
            </Route>
        </Routes>
    </BrowserRouter>,
    document.getElementById('root')
);