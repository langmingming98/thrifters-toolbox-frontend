import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { initializeApp } from "firebase/app";
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import { getAnalytics } from "firebase/analytics";
import { Collapse, Tooltip } from 'bootstrap';
import { Chart } from "react-google-charts";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { getDatabase, ref, push, set, query, orderByChild, limitToLast, onValue } from "firebase/database";
import { getAuth, reauthenticateWithCredential } from "firebase/auth";

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
            <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: "#274e13" }}>
                <div className="container">
                    <Link to="/" key="search" className="navbar-brand mb-0 h1" style={{ color: "#f2f1ce" }}>Thrifter's Toolbox</Link>
                    <Link to="/trends" key="trending" className="nav-link" style={{ color: "#f2f1ce" }}>Trending</Link>
                </div>
            </nav>
            <div className="container">
                <Outlet />
            </div>
            <footer style={{padding: "3px"}}> 
                <p className='text-muted text-center'><small> - please note that your search may be used in the trending page - 
                    <br></br> made by <a href="https://github.com/langmingming98" target="_blank" className="link-dark">langmingming98</a></small></p>
                <p className='text-muted text-center'><small>  </small></p>
                 <p></p> </footer>
        </div>
    )
}

function postKeyword(keyword) {
    const postListRef = ref(database, 'search_record');
    const newPostRef = push(postListRef);
    set(newPostRef, {
        keyword: cleanKeyword(keyword)
    });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const axios = require('axios');

function cleanKeyword(keyword) {
    return keyword.toLowerCase().replaceAll("[^A-Za-z0-9\s]", "");
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
            })
            resolve(searchRecord)
        }, {
            onlyOnce: true
        })
    })
}

//Anurag https://stackoverflow.com/a/3579651
function sortByFrequency(array) {
    var frequency = {};
    array.forEach(function (value) { if (value != "") { frequency[value] = 0; } });
    var uniques = array.filter(function (value) {
        return ++frequency[value] == 1;
    });
    var sorted = uniques.sort(function (a, b) {
        return frequency[b] - frequency[a];
    });
    return sorted.map(a => [a, frequency[a]])
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
        var sorted = sortByFrequency(this.state.searchRecord);
        if (sorted.length === 0) {
            return (<div></div>);
        }
        var sortedTop10 = sorted.slice(0, 10);
        var maxFrequency = sortedTop10[0][1];
        return (
            <div className="d-flex flex-column" style={{ width: "80%", minHeight: '500px', margin: "auto", padding: "20px" }}>
                <table className="table table align-middle table-hover table-borderless">
                    <thead>
                        <tr>
                        <th style={{ width: '5%' }} scope="col"></th>
                            <th style={{ width: '25%' }} scope="col"></th>
                            <th style={{ width: '70%' }} scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTop10.map((item, idx) =>
                            <tr>
                                <th scope="row">{idx+1}</th>
                                <td><div> {item[0]}</div></td>
                                <td> <div className="progress">
                                    <div className="progress-bar-striped bg-success progress-bar-animated" role="progressbar" style={{ width: Math.round(100 * item[1] / maxFrequency) + '%' }} aria-valuenow="{Math.round(100*item[1]/maxFrequency)}" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

class Search extends Component {

    constructor(props) {
        super(props);
        this.state = {
            keyword: '', results: [], lastKeyword: '',
            showAdvancedSearch: false,
            showSubcategoryWomen: false,
            showSubcategoryMen: false,
            showSubcategoryKids: false
        };
        this.colors = ['Black', 'Blue', 'Pink', 'Grey', 'White', 'Brown', 'Red', 'Green', 'Beige', 'Purple',
            'Silver', 'Gold', 'Orange', 'Yellow', 'Tan'];
        this.subcategoryWomen = ['Accessories', 'Bags', 'Dresses', 'Intimates & Sleepwear', 'Jackets & Coats', 'Jeans',
            'Jewelry', 'Makeup', 'Pants & Jumpsuits', 'Shoes', 'Shorts', 'Skirts', 'Sweaters', 'Swim',
            'Tops', 'Skincare', 'Hair', 'Bath & Body', 'Global & Traditional Wear'];
        this.subcategoryMen = ['Accessories', 'Bags', 'Jackets & Coats', 'Jeans', 'Pants', 'Shirts', 'Shoes', 'Shorts',
            'Suits & Blazers', 'Sweaters', 'Swim', 'Underwear & Socks', 'Grooming', 'Global & Traditional Wear'];
        this.subcategoryKids = ['Accessories', 'Bottoms', 'Dresses', 'Jackets & Coats', 'Matching Sets', 'One Pieces',
            'Pajamas', 'Shirts & Tops', 'Shoes', 'Swim', 'Costumes', 'Bath, Skin & Hair', 'Toys'];
        this.randomSearch = ["Levi's Jeans", 'Aritzia Super Puff', 'iPhone 13', 'Gunne Sax dress', 'Buffalo London Sneakers',
            "Victoria's Secret Bra", 'Vintage Slip Dress', 'Nintendo Switch', 'Mid Century Modern Decor'];

        this.handleClickSearch = this.handleClickSearch.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleAdvancedSearch = this.handleAdvancedSearch.bind(this);
        this.handleRandomSearch = this.handleRandomSearch.bind(this);
        this.handleSubcategoryWomen = this.handleSubcategoryWomen.bind(this);
        this.handleSubcategoryMen = this.handleSubcategoryMen.bind(this);
        this.handleSubcategoryKids = this.handleSubcategoryKids.bind(this);
    }

    handleInputChange(event) {
        this.setState({ keyword: event.target.value });
    }

    computeStats(priceArray) {
        const asc = priceArray => priceArray.sort((a, b) => a - b);
        var priceArraySort = asc(priceArray);
        var minValue = priceArraySort[0];
        var maxValue = priceArraySort[priceArraySort.length-1];
        const quantile = (priceArray, q) => {
            const sorted = asc(priceArray);
            const pos = (sorted.length - 1) * q;
            const base = Math.floor(pos);
            const rest = pos - base;
            if (sorted[base + 1] !== undefined) {
                return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
            } else {
                return sorted[base];
            }
        };
        const q25 = priceArray => quantile(priceArray, .25);
        const q50 = priceArray => quantile(priceArray, .50);
        const q75 = priceArray => quantile(priceArray, .75);
        const median = priceArray => q50(priceArray);


        var list = [minValue,q25(priceArray),median(priceArray),q75(priceArray),maxValue];
        return list;
    }

    async handleClickSearch() {
        var searchButton = document.getElementById('searchButton');
        var randomButton = document.getElementById('randomButton');
        searchButton.disabled = true;
        randomButton.disabled = true;
        searchButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        
        var keyword = this.state.keyword;
        var local = 'http://localhost:3001/api';
        var heroku = 'https://infinite-fortress-72552.herokuapp.com/api';
        var url;
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            url = local;
        } else {url = heroku;}

        const { data } = await axios.get(url, { params: { search: keyword } });

        var results = [];
        if (data['poshmark_price'].length > 5 && data['mercari_price'].length > 5) {
        var poshmarkStats = this.computeStats(data['poshmark_price']);
        var mercariStats = this.computeStats(data['mercari_price']);
        results.push(["x", "Mercari", "Poshmark"]);
        results.push(["Lowest", poshmarkStats[0], mercariStats[0]]);
        results.push(["Lower Quartile", poshmarkStats[1], mercariStats[1]]);
        results.push(["Median", poshmarkStats[2], mercariStats[2]]);
        results.push(["Upper Quartile", poshmarkStats[3], mercariStats[3]]);
        results.push(["Highest", poshmarkStats[4], mercariStats[4]]);
        this.setState({ results: results });}
        else {
            console.log('too few');
        }
        postKeyword(keyword);
        this.setState({lastKeyword: this.state.keyword});
        searchButton.disabled = false;
        randomButton.disabled = false;
        searchButton.innerHTML = 'Search';
    }

    async handleAdvancedSearch() {
        this.setState({ showAdvancedSearch: !this.state.showAdvancedSearch });
    }

    async handleRandomSearch() {
        var search = document.getElementById('searchInput');
        search.value = this.randomSearch[Math.floor(Math.random() * this.randomSearch.length)];
        this.setState({ keyword: search.value }, () => {
            this.handleClickSearch();
        });
    }

    componentDidUpdate() {
        // var bsWomen = new Collapse(document.getElementById('subcategoryWomen'), { toggle: false });
        // this.state.showSubcategoryWomen ? bsWomen.show() : bsWomen.hide();
        // var bsMen = new Collapse(document.getElementById('subcategoryMen'), { toggle: false });
        // this.state.showSubcategoryMen ? bsMen.show() : bsMen.hide();
        // var bsKids = new Collapse(document.getElementById('subcategoryKids'), { toggle: false });
        // this.state.showSubcategoryKids ? bsKids.show() : bsKids.hide();
        // var bsAdvanced = new Collapse(document.getElementById('advancedSearch'), { toggle: false });
        // this.state.showAdvancedSearch ? bsAdvanced.show() : bsAdvanced.hide();
    }

    componentDidMount() {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new Tooltip(tooltipTriggerEl)
        })
    }

    async handleSubcategoryWomen() {
        this.setState({ showSubcategoryWomen: !this.state.showSubcategoryWomen });
        this.setState({ showSubcategoryMen: false });
        this.setState({ showSubcategoryKids: false });
    }

    async handleSubcategoryMen() {
        this.setState({ showSubcategoryWomen: false });
        this.setState({ showSubcategoryMen: !this.state.showSubcategoryMen });
        this.setState({ showSubcategoryKids: false });
    }

    async handleSubcategoryKids() {
        this.setState({ showSubcategoryWomen: false });
        this.setState({ showSubcategoryMen: false });
        this.setState({ showSubcategoryKids: !this.state.showSubcategoryKids });
    }

    render() {
        const colorButtons = this.colors.map((d) => <button type="button" className="btn btn-light" key={d}>{d}</button>);
        const subcategoryWomenButtons = this.subcategoryWomen.map((d) => <button type="button" className="btn btn-light" key={d}>{d}</button>);
        const subcategoryMenButtons = this.subcategoryMen.map((d) => <button type="button" className="btn btn-light" key={d}>{d}</button>);
        const subcategoryKidsButtons = this.subcategoryKids.map((d) => <button type="button" className="btn btn-light" key={d}>{d}</button>);

        return (
            <div className="d-flex flex-column" style={{ minWidth: '500px', maxWidth: '800px', minHeight: '300px', margin: "auto", padding: "70px" }}>
                <div className="text-center">
                    <img src="/logo.PNG" className="img-fluid" alt="banner"></img>
                </div>
                <div className="d-flex flex-wrap">
                <div className="input-group mb-3">
                    <button type="button" className="btn btn-outline-success" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Search an item and see how much it sells on Poshmark and Mercari"> <i className="bi bi-question-circle"></i> </button>
                    <input type="text" className="form-control" id="searchInput" placeholder="Try Levi's Jeans" onChange={this.handleInputChange}></input>
                    <button className="btn btn-outline-success" id="searchButton" type="button" style={{ width: '100px' }} onClick={this.handleClickSearch} disabled={this.state.keyword.replace(/\s/g, '') === ""}>Search</button>
                    <button className="btn btn-outline-success" id="randomButton" type="button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Search a popular item" onClick={this.handleRandomSearch}> <i className="bi bi-shuffle"></i> </button>
                </div>
                </div>
                
                <div>
                    {/* <button className="btn btn-link btn-sm" type="button" onClick={this.handleAdvancedSearch}> Advanced Search </button> */}
                </div>


                {/* <div className="collapse" id="advancedSearch">
                    <div> Category </div>
                    <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                        <div className="btn-group mr-2" role="group" aria-label="First group">
                            <button type="button" className="btn btn-light" onClick={this.handleSubcategoryWomen}>Women</button>
                            <button type="button" className="btn btn-light" data-bs-toggle="collapse" data-bs-target="#subcategoryMen" aria-expanded="false" aria-controls="subcategoryMen" onClick={this.handleSubcategoryMen}>Men</button>
                            <button type="button" className="btn btn-light" data-bs-toggle="collapse" data-bs-target="#subcategoryKids" aria-expanded="false" aria-controls="subcategoryKids" onClick={this.handleSubcategoryKids}>Kids</button>
                        </div>
                    </div>

                    <div className="collapse" id="subcategoryWomen">
                        <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                            <div className="btn-group mr-2" role="group">
                                {subcategoryWomenButtons}
                            </div>
                        </div>
                    </div>

                    <div className="collapse" id="subcategoryMen">
                        <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                            <div className="btn-group mr-2" role="group">
                                {subcategoryMenButtons}
                            </div>
                        </div>
                    </div>

                    <div className="collapse" id="subcategoryKids">
                        <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                            <div className="btn-group mr-2" role="group">
                                {subcategoryKidsButtons}
                            </div>
                        </div>
                    </div>

                    <div> Color </div>
                    <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                        <div className="btn-group mr-2" role="group" aria-label="First group">
                            {colorButtons}
                        </div>
                    </div>
                </div> */}

                <div id="searchResults">
                    {(this.state.results.length != 0) && 
                    <div>
                    <p className="text-center"> <b>{this.state.lastKeyword}</b> on average sells for <b>{'$'+this.state.results[3][1]}</b> on Poshmark and <b>{'$'+this.state.results[3][2]}</b> on Mercari. </p>
                    <Chart chartType="BarChart" width="100%" height="400px" data={this.state.results} options={{
                          vAxis: {
                            chartArea: { width: "50%" },
                            hAxis: {
                                title: "Price in USD",
                                minValue: 0,
                                logScale: true,
                            },

                            
                          }
                    }} /> </div>
                }


                    {/* {this.state.results} */}
                    
                    
                    
                </div>
            </div>)
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