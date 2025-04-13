import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Dashboard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers ,faBook, faPlus, faBookBookmark, faTriangleExclamation, faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import { VerticalBarChart } from '../VerticalBarChart';
import DashboardTable from '../DashboardTable/DashboardTable';
import DashboardTopChoices from '../DashboardTopChoices/DashboardTopChoices';
import DashBox from '../DashBox/DashBox';
import { Link, useNavigate } from 'react-router-dom';
import {useDispatch} from 'react-redux';
import { setBorrowedStats, setVisitorStats } from '../../features/chartSlice.js';


const Dashboard = () => {
  const [dateTime,setDateTime] = useState(new Date());
  const [uname, setUname] = useState(null)

  const [totalVisitors, setTotalVisitors] = useState("");
  const [totalVisitorsLoading, setTotalVisitorsLoading] = useState(false);

  const [totalBorrowed, setTotalBorrowed] = useState("");
  const [totalBorrowedLoading, setTotalBorrowedLoading] = useState(false);

  const [totalReturned, setTotalReturned] = useState("");
  const [totalReturnedLoading, setTotalReturnedLoading] = useState(false);

  const [totalOverdue, setTotalOverdue] = useState("");
  const [totalOverdueLoading, setTotalOverdueLoading] = useState(false);

  const [overdueBooks, setOverdueBooks] = useState([]);
  const [overdueBooksLoading, setOverdueBooksLoading] = useState(false);

  const [bookList, setBookList] = useState([]);
  const [bookListLoading, setBookListLoading] = useState(false);

  const [issuedBooks, setIssuedBooks] = useState([]);
  const [issuedBooksLoading, setIssuedBooksLoading] = useState(false);

  const [popularChoices, setPopularChoices] = useState([]);
  const [popularChoicesLoading, setPopularChoicesLoading] = useState(false);
  
  const overdueListHeader = ["Tup ID","Borrower's Name","Book ID","Title","Overdue Days"];
  const bookListHeader = ["Book ID","Title","Author","Copies Available"];
  const bookIssuedHeader = ["Tup ID","Title","Return Date"];
  const dispatch = useDispatch()
  
  useEffect(() => {
    getUsername()
    getTotalVisitors();
    getTotalBorrowed();
    getTotalReturned();
    getTotalOverdue();
    getOverdueBooks();
    getBookList();
    getIssued();
    getPopularChoices();
    getBookTrends();
    getVisitorStats();
  }, []);

  const getUsername = async()=>{
    try {
      // Request server to verify the JWT token
      const response = await axios.get('http://localhost:3001/api/user/check-session', { withCredentials: true });
      console.log(response.data)
      // If session is valid, set the role
      if (response.data.loggedIn) {
        setUname(response.data.username);
      } else {
        setUname(null); // If not logged in, clear the role
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      setUname(null); // Set null if there's an error
    }
  }

  //total visitors
  const getTotalVisitors = async () => {
    setTotalVisitorsLoading(true)
    try {
      const response = await axios.get(`http://localhost:3001/api/dashboard/total-visitors`);
      setTotalVisitors(response.data.total_attendance); // Adjust based on your backend response
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching total visitors:", err.message);
    } finally{
      setTimeout(()=>{
        setTotalVisitorsLoading(false)
      },3000)
    }
  };

  //total borrowed
  const getTotalBorrowed = async () => {
    setTotalBorrowedLoading(true)
    try {
      const response = await axios.get(`http://localhost:3001/api/dashboard/total-borrowed`);
      setTotalBorrowed(response.data.total_borrowed); // Adjust based on your backend response
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching total borrowed books:", err.message);
    } finally{
      setTimeout(()=>{
        setTotalBorrowedLoading(false)
      },3000)
    }
  };

  //total returned
  const getTotalReturned = async () => {
    setTotalReturnedLoading(true)
    try {
      const response = await axios.get(`http://localhost:3001/api/dashboard/total-returned`);
      setTotalReturned(response.data.total_returned); // Adjust based on your backend response
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching total returned books:", err.message);
    } finally{
      setTimeout(()=>{
        setTotalReturnedLoading(false)
      },3000)
    }
  };

  //total overdue
  const getTotalOverdue = async () => {
    setTotalOverdueLoading(true)
    try {
      const response = await axios.get(`http://localhost:3001/api/dashboard/total-overdue`);
      setTotalOverdue(response.data.total_overdue); // Adjust based on your backend response
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching total overdue books:", err.message);
    } finally{
      setTimeout(()=>{
        setTotalOverdueLoading(false)
      },3000)
    }
  };

  //overdue books
  const getOverdueBooks = async () => {
    setOverdueBooksLoading(true)
    try {
        await axios.get(`http://localhost:3001/api/dashboard/overdue-books`)
        .then(response=>{
          console.log(response.data)
          setOverdueBooks(response.data);
        })
    } catch (error) {
        console.error('Error fetching overdue books:', error);
    } finally{
      setTimeout(()=>{
        setOverdueBooksLoading(false)
      },3000)
    }
  };

  //get book trends
  const getBookTrends = async()=>{
    try{
      const response = await axios.get(`http://localhost:3001/api/dashboard/book-statistics`)
      const books = response.data;
      console.log(books)
      const borrowingTrends = books.map(item=>
        item.total_checkouts
      )
      dispatch(setBorrowedStats(borrowingTrends))
    }catch(err){
      console.log('Cannot get borrowed book trends. An error occurred: ', err.message)
    }
  }

  const getVisitorStats = async()=>{
    try{
      const response = await axios.get(`http://localhost:3001/api/dashboard/visitor-statistics`)
      const visitors = response.data;
      console.log(visitors)

      const visitorsStats = visitors.map(item=>
        item.total_attendance
      )
      dispatch(setVisitorStats(visitorsStats))
      
    }catch(err){
      console.log('Cannot get borrowed book trends. An error occurred: ', err.message)
    }
  }

  //books list
  const getBookList = async()=>{
    setBookListLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/dashboard/book-list`).then(res=>res.data);
      setBookList(response)
      console.log(response)
    } catch (err) {
        console.log(err.message);
    } finally{
      setTimeout(()=>{
        setBookListLoading(false)
      },3000)
    }
  }

   //book issued
   const getIssued = async()=>{
    setIssuedBooksLoading(true)
    try {
      const response = await axios.get(`http://localhost:3001/api/dashboard/issued-books`).then(res=>res.data);
      setIssuedBooks(response)
      console.log(response)
    } catch (err) {
        console.log(err.message);
    } finally{
      setTimeout(()=>{
        setIssuedBooksLoading(false)
      },3000)
    }
  }

  //book issued
  const getPopularChoices = async()=>{
    setPopularChoicesLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/dashboard/popular-choices`).then(res=>res.data);
      setPopularChoices(response)
      console.log(response)
    } catch (err) {
        console.log(err.message);
    } finally{
      setTimeout(()=>{
        setPopularChoicesLoading(false);
      },3000)
      
    }
  }

  // const navigate = useNavigate();

  // const handleTodayEntriesClick = () => {
  //     navigate('/logbook?filter=today'); // Navigate to logbook with filter
  // };

  return (
    <div className='dashboard-container bg-light'>
       {/* dashboard heading */}
       <div className="dashboard-heading">
          {/* Goodmorning,admin */}
          <p className='dashboard-heading-text'>{dateTime.getHours()>=1 && dateTime.getHours()<12?'Good morning, ':dateTime.getHours()>=12&&dateTime.getHours()<17?'Good afternoon, ':'Good evening,'} <span>{uname}</span></p>
      </div>
      

      {/* columns */}
      <div className="dashboard">
        {/* column 1 */}
        <div className="dashboard-1 row gap-3">
          {/* total visitors */}
          <DashBox icon={<FontAwesomeIcon icon={faUsers} className='icon'/>} title={"Total Visits"} total={totalVisitors} loading={totalVisitorsLoading}/>

          {/* borrowed resources */}
          <DashBox icon={<FontAwesomeIcon icon={faBookBookmark} className='icon'/>} title={"Borrowed Resources"} total={totalBorrowed} loading={totalBorrowedLoading}/>

          {/* returned resources */}
          <DashBox icon={<FontAwesomeIcon icon={faBook} className='icon'/>} title={"Returned Resources"} total={totalReturned} loading={totalReturnedLoading}/>
          
          {/* overdue resources */}
          <DashBox icon={<FontAwesomeIcon icon={faTriangleExclamation} className='icon'/>} title={"Overdue Resources"} total={totalOverdue} loading={totalOverdueLoading}/>

          {/* bar chart */}
          <div className="bar-chart col-12 shadow-sm">
            <h5>Visitors and Borrowers Statistics</h5>
            <VerticalBarChart/>
          </div>

          {/* overdue book list */}
          <div className="overdue-table bg-light py-4">
            <div className='d-flex align-items-center justify-content-start gap-5 py-3'>
              <h5 className='m-0'>Overdue Book List</h5>
              {/* <button className='see-all btn'>See all</button> */}
            </div>
            <DashboardTable header={overdueListHeader} data={overdueBooks} type={"overdue"} loading={overdueBooksLoading}/>
          </div>

          {/* book list */}
          <div className="book-table bg-light py-4">
            <div className='d-flex justify-content-between'>
              <div className='d-flex align-items-center justify-content-start gap-5 py-3'>
                <h5 className='m-0'>Book List</h5>
                <Link to='/catalog'>
                  <button className='see-all btn'>See all</button>
                </Link>
                
              </div>
              <Link to="/catalog/add">
                <button className="btn btn-outline-dark d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faPlus}/>
                  Add new
                </button>
              </Link>
              
            </div>
            
            <DashboardTable header={bookListHeader}  data={bookList} type={"books"} loading={bookListLoading}/>
          </div>
        </div>

        {/* column 2 */}
        <div className="dashboard-2">
          {/* top choices*/}
          <div className="top-choices d-flex flex-column gap-3">
            <h5>Popular Choices</h5>
            {popularChoicesLoading?[1,2,3,4,5].map(item=>(
              <div className='top-choices-container d-flex align-items-center gap-3'>
                <div>
                    <div className='m-0 top-number2 d-flex align-items-center justify-content-center'></div>
                </div>
                <div className='top-choices-content2'>
                    <div>
                      <div className='top-choices-cover2'></div>
                    </div>
                    <div className='top-choices-details2'>
                        <div className='m-0 fw-semibold'></div>
                        <div className='mt-1'></div>
                        <div className='mt-2'></div>
                    </div>
                </div>
            </div>
            )):popularChoices&&popularChoices.length>0 ? popularChoices.map((item, index) => (
              <DashboardTopChoices key={index} data={item} number={index + 1} />
            )) : 
            <div className='d-flex flex-column align-items-center gap-2 my-3 text-center'>
              <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 no-data" />
              <span>No popular choices yet.</span>
            </div>}
          </div>

          {/* books issued list */}
          <div className="issued-table px-3 py-5">
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center justify-content-start gap-3 py-3'>
                <h5 className='m-0'>Books Issued</h5>
                <p className='books-issued-total m-0 d-flex align-items-center justify-content-center rounded-5'>{issuedBooks&&issuedBooksLoading?'':issuedBooks.length}</p>
              </div>
              <Link to='/circulation'>
                <button className='btn see-all'>See all</button>
              </Link>
              
            </div>
            
            <DashboardTable header={bookIssuedHeader} data={issuedBooks} type={"issued"} loading={issuedBooksLoading}/>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Dashboard
