const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const MOVIES_PER_PAGE = 12 //每頁只顯示 12 筆資料
let filteredMovies = [] //儲存符合篩選條件的項目

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image, id 隨著每個 item 改變
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${
          POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`
  })
}

//加入收藏
function addToFavorite(id) {
  //因localStorage 僅能存string,取出資料時使用JSON.parse，將 JSON 格式的字串轉回 JavaScript 原生物件
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] 

  //使用find()找出id相同的電影物件回傳，暫存在 movie參數
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  //把 movie 推進收藏清單
  list.push(movie)
  // 呼叫 localStorage.setItem，存入時，將資料轉為 JSON 格式的字串．把更新後的收藏清單同步到 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 監聽 data panel
dataPanel.addEventListener('click',function onPanelClicked(event){
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//從總清單裡切割資料，然後回傳切割好的新陣列
function getMoviesByPage(page) {
  //若為搜尋篩選後的資料也需要分頁，採用三元運算子，如果搜尋結果有東西，條件判斷為 true ，會回傳 filteredMovies，然後用 data 保存回傳值
  const data = filteredMovies.length ? filteredMovies : movies
  //未執行搜尋，計算起始 index (page1 -> 0-11 page2 -> 12-23 page 24-35 ...)
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

  //分頁
function renderPaginator(amount) { //資料總筆數amount相當於movies陣列的長度
  //計算總頁數 Math.ceil 無條件進位函數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length) //新增這裡
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))


paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

//監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  
//錯誤處理：輸入無效字串
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }


  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
// 條件篩選 【作法一】用迴圈迭代：for-of
//   for (const movie of movies) {
//   if (movie.title.toLowerCase().includes(keyword)) {
//     filteredMovies.push(movie)
//   }
// } 
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  //分頁器的長度，是根據 filteredMovies 的長度來決定需重新呼叫renderPaginator()
  renderPaginator(filteredMovies.length)  
  //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))
})




  