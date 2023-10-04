"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

// student code -  adjusted this function to generate a markup that includes star icon for favorited stories, trash icon for my stories stories, and no icon when a user is not logged in
function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  if(currentUser) {
    for (let fave of currentUser.favorites) {
      if(story.storyId === fave.storyId) {
        return $(`
        <li id="${story.storyId}">
          <span class="clicked"></span>
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </li>
      `);
      }
    }
    return $(`
        <li id="${story.storyId}">
          <span class="star"></span>
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </li>
      `);
  }
  return $(`
  <li id="${story.storyId}">
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>
  </li>
`);
}
// end of student code

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// student code - this function and event listener adds a new story on submit by taking the values from the submit form and updates currentuser variable to contain new story
async function addNewStory(e) {
  console.debug("addNewStory",e);
  e.preventDefault();

  const article = {
    title : $("#story-title").val(),
    author : $("#story-author").val(),
    url : $("#story-url").val()
  };
  await storyList.addStory(currentUser, article);  
  
  $storyForm.hide();
  $storyForm.trigger("reset");
  checkForRememberedUser();
}

$storyForm.on("submit",addNewStory);
// end of student code

// student code -  the following 2 functions send favorite stories to api to be stored, and delete favorited stories from api when called with username and story id
async function addFavorite ( username, storyid) {
  console.debug("addFavorite");

  const response = await axios({
    url: `${BASE_URL}/users/${username}/favorites/${storyid}`,
    method: "POST",
    data : {
      'token' : currentUser.loginToken
    }
  })
}

async function deleteFavorite ( username, storyid) {
  console.debug("deleteFavorite");

  const response = await axios({
    url: `${BASE_URL}/users/${username}/favorites/${storyid}`,
    method: "DELETE",
    data : {
      'token' : currentUser.loginToken
    }
  })
}
// end of student code

// student code - the following event listeners call the add and delete favorite functions when star is clicked or un clicked. they also change the classes of the stars aswell
$('body').on('click', '.star', async function (e) {
  e.target.className = ('clicked');
  await addFavorite(currentUser.username,e.target.parentElement.id);
  await checkForRememberedUser();
})

$('body').on('click', '.clicked', async function (e) {
  e.target.className = ('star');
  await deleteFavorite(currentUser.username,e.target.parentElement.id);
  await checkForRememberedUser();
  putFavoritesOnFaveList();
})
// end of student code

// student code - the following functions display favorites and my stories list
function putFavoritesOnFaveList() {
  if (currentUser.favorites.length > 0) {
    console.debug("putFavoritesOnFaveList");

    $faveStories.empty();

    for(let fave of currentUser.favorites){
      const $fave = generateStoryMarkup(fave);
      $faveStories.append($fave);
    }
  }
  else {
    $faveStories.empty();
    $faveStories.append("No favorites added!")
  }
}

function putMyStoriesOnList() {
  if (currentUser.ownStories.length > 0) {
    console.debug("putMyStoriesOnList");

    $myStoriesList.empty();

    for(let story of currentUser.ownStories){
      const $story = generateStoryMarkup(story);
      $story.prepend(
        '<span class="trash"></span>'
      )
      $myStoriesList.append($story);
    }
  }
  else {
    $myStoriesList.empty();
    $myStoriesList.append("No stories added!")
  }
}
// end student code

async function deleteStory(storyId) {
  console.debug("deleteStory");

  const response = await axios({
    url: `${BASE_URL}/stories/${storyId}`,
    method: "DELETE",
    data: {
      'token' : currentUser.loginToken
    }
  })
  await checkForRememberedUser();
}

$('body').on('click', '.trash', async function(e){
  await deleteStory(e.target.parentElement.id);
  putMyStoriesOnList();
})