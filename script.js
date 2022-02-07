"use strict";

// Array til elever
const allStudents = [];
let filteredStudents = allStudents;

// Prototype for eleverne
const Student = {
  image: "",
  firstName: "-unknown-",
  middleName: "",
  lastName: "-unknown-",
  nickname: "",
  house: "-unknown-",
  gender: "-unknown-",
  prefects: false,
  squad: false,
  blood: "-unknown-",
  expelled: false,
};


const studentSection = document.querySelector("#student_list");
const popupSection = document.querySelector("#popup");

// Globale variabler
let firstName;
let middleName;
let lastName;
let nickName;
let house;
let image;

// Knapper
const filterButtons = document.querySelectorAll(`[data-action="filter"]`);

// sorter og filtrering
const settings = {
  filterBy: "all",
  sortBy: "firstName",
  sortDir: "asc",
};

window.addEventListener("DOMContentLoaded", start);

function start() {
  loadJSON();
  startFltrBtns();
}

async function loadJSON() {
  console.log("loadJSON");

  const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
  const studentArray = await response.json();
  const responseBlood = await fetch("https://petlatkea.dk/2021/hogwarts/families.json");
  const bloodArray = await responseBlood.json();

  // When loaded, prepare data objects
  prepareObjects(studentArray, bloodArray);
}

function prepareObjects(studentArray, bloodArray) {
  studentArray.forEach((element) => {
    // Create new object with cleaned data - and store that in the allStudents array
    const student = Object.create(Student);
    student.firstName = getFirstName(element.fullname);
    student.middleName = getMiddleName(element.fullname);
    student.lastName = getLastName(element.fullname);
    student.nickName = getNickName(element.fullname);
    student.house = element.house;
    student.image = getImage(element.fullname);
    student.gender = element.gender;
    student.blood = getBloodInfo(student, bloodArray);
    allStudents.push(student);
  });

  console.log(bloodArray);
  // Retter efterfølgende bogstaverne til.
  changeLetters();
  buildList();
  document.querySelector("#search").addEventListener("input", searchStudent);
}

console.log(allStudents);

function getFirstName(fullname) {
  //console.log("getFirstName");
  // Sørger for at der ikke er nogle navne der har mellemrum inden
  firstName = fullname.trimStart();

  // If-sætning, da en af eleverne kun har ét navn
  if (fullname.includes(" ")) {
    firstName = firstName.substring(0, firstName.indexOf(" "));
  } else {
    firstName = fullname;
  }
  return firstName;
  // console.log(firstName);
}

function getMiddleName(fullname) {
  middleName = fullname.trim();
  // Splitter navn ved mellemrum
  middleName = middleName.split(" ");

  //tjekker for mere end 2 navne. Hvis ja, bliver midten til mellemnavn, ellers undefined.
  if (middleName.length > 2) {
    middleName = middleName[1];
  } else {
    middleName = "";
  }

  if (middleName === `"Ernie"`) {
    middleName = "";
  }
  return middleName;
}

function getLastName(fullname) {
  lastName = fullname.trim();
  //navn efter sidste mellemrum bliver til efternavn.
  lastName = lastName.substring(lastName.lastIndexOf(" ") + 1);
  if (lastName === firstName) {
    lastName = "";
  }

  return lastName;
}

function getNickName(fullname) {
  nickName = fullname.split(" ");

  // Gør navn nr. 2 til nickname, hvis fullname indeholder ".
  if (fullname.indexOf(` "`) >= 0) {
    nickName = nickName[1];
  } else {
    nickName = "";
  }

  return nickName;
}

function getImage(fullname) {
  if (lastName === `Patil`) {
    image = `./images/${lastName.toLowerCase()}_${firstName.toLowerCase()}.png`;
  } else if (firstName === `Leanne`) {
    image = `images/hogwarts.png`;
  } else if (firstName === `Justin`) {
    lastName = lastName.split("-");
    image = `./images/${lastName[1].toLowerCase()}_${firstName.substring(0, 1).toLowerCase()}.png`;
  } else {
    image = `./images/${lastName.toLowerCase()}_${firstName.substring(0, 1).toLowerCase()}.png`;
  }
  return image;
}

function getBloodInfo(student, blood) {
  student.lastName = student.lastName.substring(0, 1).toUpperCase() + student.lastName.substring(1).toLowerCase();

  if (blood.half.includes(student.lastName)) {
    student.blood = "Half-blood";
  } else if (blood.pure.includes(student.lastName)) {
    student.blood = "Pure-blood";
  } else {
    student.blood = "Muggle-blood";
  }
  return student.blood;
}

function changeLetters() {
  allStudents.forEach((student) => {
    student.firstName = student.firstName.substring(0, 1).toUpperCase() + student.firstName.substring(1).toLowerCase();
    student.middleName = student.middleName.substring(0, 1).toUpperCase() + student.middleName.substring(1).toLowerCase();
    student.lastName = student.lastName.substring(0, 1).toUpperCase() + student.lastName.substring(1).toLowerCase();
    if (student.lastName.includes("-")) {
      let findHypen = student.lastName.split("-");
      console.log(findHypen[1]);
      findHypen[1] = findHypen[1].substring(0, 1).toUpperCase() + findHypen[1].substring(1).toLowerCase();
      student.lastName = findHypen.join("-");
    }
    student.house = student.house.trim();
    student.house = student.house.substring(0, 1).toUpperCase() + student.house.substring(1).toLowerCase();
    student.gender = student.gender.substring(0, 1).toUpperCase() + student.gender.substring(1).toLowerCase();
  });
}

function showStudents(students) {
  const allStudentTemplate = document.querySelector(".student");

  students.forEach((student) => {
    const clone = allStudentTemplate.cloneNode(true).content;

    clone.querySelector(".studentcard .student_image").src = `${student.image}`;
    clone.querySelector(".studentcard .student_name").textContent = `${student.firstName} ${student.lastName}`;
    clone.querySelector(".studentcard .house").textContent = `${student.house}`;
    clone.querySelector(".read_more").addEventListener("click", () => moreInfo(student));

    clone.querySelector("[data-field=expelled]").addEventListener("click", clickExpelled);

    if (student.expelled) {
      clone.querySelector("[data-field=expelled]").classList.add("expelled_true");
      clone.querySelector(".studentcard").style.background = "#313131";
      clone.querySelector(".student_image").style.filter = "grayscale(1)";
    }

    function clickExpelled() {
      console.log("clickExpelled");
      if (student.expelled === false) {
        student.expelled = true;
        console.log("den studerende bliver expelled");
      }
      buildList();
    }

    if (student.squad === true) {
      clone.querySelector(".squad img").classList.remove("false");
    } else if (student.squad === false) {
      clone.querySelector(".squad img").classList.add("false");
    }

    clone.querySelector("[data-field=squad]").addEventListener("click", clickSquad);

    function clickSquad() {
      if (student.house === "Slytherin" || student.blood === "Pure-blood") {
        if (student.squad) {
          student.squad = false;
        } else {
          student.squad = true;
        }
      } else {
        canNotBeSquad(student);
      }
      buildList();
    }

    function canNotBeSquad(student) {
      console.log("test");
      document.querySelector("#noSquad").classList.remove("hide");
      document.querySelector("#noSquad .close").addEventListener("click", closeDialog);
    }

    function closeDialog() {
      document.querySelector("#noSquad").classList.add("hide");
      document.querySelector("#noSquad .close").removeEventListener("click", closeDialog);
    }

    // for prefects
    if (student.prefects === true) {
      clone.querySelector(".prefects img").classList.remove("false");
    } else if (student.prefects === false) {
      clone.querySelector(".prefects img").classList.add("false");
    }

    clone.querySelector("[data-field=prefects]").addEventListener("click", clickPrefects);

    function clickPrefects() {
      if (student.prefects) {
        student.prefects = false;
      } else {
        tryToMakePrefect(student);
      }
      buildList();
    }

    studentSection.appendChild(clone); // clone to section
  });
}

function tryToMakePrefect(selectedStudent) {
  const prefects = filteredStudents.filter((student) => student.prefects);

  const other = prefects.filter((student) => student.house === selectedStudent.house);
  const gender = other.filter((student) => student.gender === selectedStudent.gender);
  const numberOfPrefects = gender.length;

  console.log(prefects);
  console.log(numberOfPrefects);
  console.log(other);
  console.log(gender);
  console.log(selectedStudent.gender);

  // if there is another of the same type
  if (numberOfPrefects >= 1) {
    console.log("there can only be one from each gender as a prefects");
    removeOther(gender[0]);
  } else {
    makePrefects(selectedStudent);
  }

  function removeOther(prefectsOther) {
    // prompts user warning (remove one)
    document.querySelector("#remove_other").classList.remove("hide");
    document.querySelector("#remove_other p").innerHTML = `There can only be one of each gender as a prefects from each house! <br> <br>
    Do you wish to remove ${prefectsOther.firstName}?`;
    document.querySelector("#remove_other .close").addEventListener("click", closeDialog);
    document.querySelector("#remove_other #removeOther").addEventListener("click", removeOther);

    // show students name
    document.querySelector("#remove_other [data-field=prefectsOther]").textContent = prefectsOther.firstName;

    function closeDialog() {
      document.querySelector("#remove_other").classList.add("hide");
      document.querySelector("#remove_other .close").removeEventListener("click", closeDialog);
      document.querySelector("#remove_other #removeOther").removeEventListener("click", removeOther);
    }

    // if remove A
    function removeOther() {
      removePrefects(prefectsOther);
      makePrefects(selectedStudent);
      buildList();
      closeDialog();
    }
  }

  function removePrefects(winnerPrefects) {
    winnerPrefects.prefects = false;
  }

  function makePrefects(student) {
    student.prefects = true;
  }
}

function moreInfo(student) {
  console.log(student);
  const moreInfoTemplate = document.querySelector(".about"); //template variabel
  document.querySelector("#popup").innerHTML = "";

  document.querySelector("#popup").classList.add("active");

  const clone = moreInfoTemplate.cloneNode(true).content;

  clone.querySelector(".about_student .student_image").src = `${student.image}`;

  clone.querySelector(".about_student .fullname").textContent = `${student.firstName} ${student.middleName} ${student.lastName}`;
  if (student.nickName === "") {
    clone.querySelector(".about_student .nickname").textContent = "";
  } else {
    clone.querySelector(".about_student .nickname").textContent = `Also know as: ${student.nickName}`;
  }
  clone.querySelector(".about_student .house").textContent = `House: ${student.house}`;
  clone.querySelector(".about_student .gender").textContent = `Gender: ${student.gender}`;
  clone.querySelector(".about_student .blood").textContent = `Blood status: ${student.blood}`;

  clone.querySelector(".about_student .close").addEventListener("click", () => {
    document.querySelector("#popup").classList.remove("active");
  });

  if (student.prefects) {
    clone.querySelector(".prefects_or_not").textContent = `Prefects: Yes`;
  } else {
    clone.querySelector(".prefects_or_not").textContent = `Prefects: No`;
  }

  if (student.squad) {
    clone.querySelector(".squad_or_not").textContent = `Member of inquisitorial squad: Yes`;
  } else {
    clone.querySelector(".squad_or_not").textContent = `Member of inquisitorial squad: No`;
  }

  popupSection.appendChild(clone); // clone ned i sektionen

  // popup color themes
  if (student.house === "Slytherin") {
    document.querySelector("#popup").style.background = "#377A43";
    document.querySelector(".crest").src = "./images/slytherin.png";
  } else if (student.house === "Ravenclaw") {
    document.querySelector("#popup").style.background = "#34528A";
    document.querySelector(".crest").src = "./images/ravenclaw.png";
  } else if (student.house === "Gryffindor") {
    document.querySelector("#popup").style.background = "#85302B";
    document.querySelector(".crest").src = "./images/gryffindor.png";
  } else {
    document.querySelector("#popup").style.background = "#ab9739";
    document.querySelector(".crest").src = "./images/hufflepuff.png";
  }

  if (student.expelled) {
    document.querySelector("#popup").style.background = "#313131";
  }
}

// FILTER AND SORT

function startFltrBtns() {
  document.querySelector("#filter").addEventListener("click", openFilterDropDown);
  document.querySelector("#sort").addEventListener("click", openSortDropDown);

  function openFilterDropDown() {
    const filterDropdown = document.querySelector("#filter .dropdown");
    if (filterDropdown.style.display === "grid") {
      filterDropdown.style.display = "none";
      document.querySelector("#filter .setting_btns").textContent = "Filter by";
    } else {
      filterDropdown.style.display = "grid";
      document.querySelector("#filter .setting_btns").textContent = "Filter by";
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", selectFilter);
    });
  }

  function openSortDropDown() {
    const sortDropdown = document.querySelector("#sort .dropdown");
    if (sortDropdown.style.display === "grid") {
      sortDropdown.style.display = "none";
      document.querySelector("#sort .setting_btns").textContent = "Sort by";
    } else {
      sortDropdown.style.display = "grid";
      document.querySelector("#sort .setting_btns").textContent = "Sort by";
    }

    document.querySelectorAll(`[data-action="sort"]`).forEach((sortButton) => {
      sortButton.addEventListener("click", selectSort);
    });
  }
}

function selectFilter(event) {
  const selctedFilter = event.target.dataset.filter;
  setFilter(selctedFilter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {

  if (settings.filterBy === "slytherin") {
    filteredList = filteredStudents.filter(isSlytherin);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = filteredStudents.filter(isHufflepuff);
  } else if (settings.filterBy === "gryffindor") {
    filteredList = filteredStudents.filter(isGryffindor);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = filteredStudents.filter(isRavenclaw);
  } else if (settings.filterBy === "prefects") {
    filteredList = filteredStudents.filter(isPrefects);
  } else if (settings.filterBy === "squad") {
    filteredList = filteredStudents.filter(isSquad);
  } else if (settings.filterBy === "expelled") {
    filteredList = allStudents.filter(isExpelled);
  }

  return filteredList;
}

function isSlytherin(student) {
  return student.house === "Slytherin";
}

function isHufflepuff(student) {
  return student.house === "Hufflepuff";
}

function isGryffindor(student) {
  return student.house === "Gryffindor";
}

function isRavenclaw(student) {
  return student.house === "Ravenclaw";
}

function isPrefects(student) {
  return student.prefects === true;
}

function isSquad(student) {
  return student.squad === true;
}

function isExpelled(student) {
  return student.expelled === true;
}

function selectSort(event) {
  const selectedSort = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // find old sortby element
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortBy");

  // active sort
  event.target.classList.add("sortBy");

  // direction of sort
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(selectedSort, sortDir);
  setSort(selectedSort, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

function buildList() {
  filteredStudents = allStudents.filter((student) => student.expelled === false);
  console.log(filteredStudents);
  const currentList = filterList(filteredStudents);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

function displayList(student) {
  // clear the list
  document.querySelector("#student_list").innerHTML = "";

  document.querySelector("#students-num").innerHTML = `Total students shown: ${student.length}`; // udskriver antallet af elever

    // counters for number of students in each house
    document.querySelector("#gryf-num").textContent = `Gryffindor: ${allStudents.filter((student) => student.house === "Gryffindor").length}`;
    document.querySelector("#huf-num").textContent = `Hufflepuff: ${allStudents.filter((student) => student.house === "Hufflepuff").length}`;
    document.querySelector("#rav-num").textContent = `Ravenclaw: ${allStudents.filter((student) => student.house === "Ravenclaw").length}`;
    document.querySelector("#sly-num").textContent = `Slytherin: ${allStudents.filter((student) => student.house === "Slytherin").length}`;

  // build a new list
  showStudents(student);
}

function searchStudent() {
  let search = document.querySelector("#site-search").value.toLowerCase();
  let searchResult = allStudents.filter(filterSearch);

  function filterSearch(student) {
    // Searching in firstName, middleName & lastName
    if (student.firstName.toString().toLowerCase().includes(search) || student.middleName.toString().toLowerCase().includes(search) || student.lastName.toString().toLowerCase().includes(search)) {
      return true;
    }
    return false;
  }
  if (search === " ") {
    displayList(allStudents);
  }
  displayList(searchResult);
}

function hackTheSystem(){
  console.log("I have not yet figured this out... So just pretend you're hacked");
}