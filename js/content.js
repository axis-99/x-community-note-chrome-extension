const PRINCIPAL_API_ENDPOINT = "YOUR_API_ENDPOINT";
const RELATED_TOPIC_API_ENDPOINT = "YOUR_API_ENDPOINT";

// アイコン要素を作成
const icon = document.createElement("img");
icon.src = chrome.runtime.getURL("icon.png"); // 'not found' エラーを防ぐため、URLを絶対パスで指定
icon.style.position = "absolute";
icon.style.cursor = "pointer";
icon.style.display = "none"; // 初期状態は非表示

icon.style.width = "32px"; // 白い丸の背景サイズ
icon.style.height = "32px";
icon.style.padding = "4px";
icon.style.borderRadius = "50%"; // 丸背景
icon.style.backgroundColor = "white"; // 背景色を白に設定
icon.style.boxShadow = "0px 0px 5px rgba(0, 0, 0, 0.3)"; // ボックスシャドウで立体感

document.body.appendChild(icon);

window.addEventListener("load", () => {
  const popup = document.getElementById("popup");
  popup.addEventListener("click", (event) => {
    event.stopPropagation(); // クリックイベントがwindowに伝播しないようにする
  });
});

window.addEventListener("click", () => {
  const popup = document.getElementById("popup");
  popup.style.display = "none";
});

fetch(chrome.runtime.getURL("popup.html"))
  .then((response) => response.text())
  .then((html) => {
    // HTMLをページに挿入
    document.body.insertAdjacentHTML("beforeend", html);
  })
  .catch((error) => console.error("Error loading popup.html:", error));

document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection().toString().trim();
  if (selection) {
    icon.style.top = `${event.pageY + 10}px`;
    icon.style.left = `${event.pageX + 10}px`;
    icon.style.display = "block";
  } else {
    icon.style.display = "none";
  }
});

// アイコンをクリックしたときの処理
icon.addEventListener("click", async (event) => {
  icon.style.display = "none"; // 処理後にアイコンを非表示にする
  const selectedText = window.getSelection().toString();
  if (selectedText) {
    const path = window.location.pathname;
    const postId = path.substring(path.lastIndexOf("/") + 1);
    const userAttr = await getUserAttr(postId);
    const topics = await getTopics(postId);
    const notes = await getNotes(topics);
    let postNotes = [];
    if (notes && notes.length > 0) {
      setNotes(notes);
    } else {
      postNotes = await getNotesByPostId(postId);
      setNotes(postNotes);
    }
    console.log({ userAttr, notes, postNotes });

    setUserAttr(userAttr);
    showPopup(event);
  }
});

/* データ取得 */

//demo
const getPosts = async (postId) => {
  return fetch(
    `https://birdxplorer.onrender.com/api/v1/data/posts?offset=0&media=false&post_ids=${postId}`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("APIリクエストでエラーが発生しました:", error);
    });
};

const getUserAttr = async (postId) => {
  return fetch(`${PRINCIPAL_API_ENDPOINT}/?post_id=${postId}`, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      return data.data;
    })
    .catch((error) => {
      console.error("APIリクエストでエラーが発生しました:", error);
    });
};
const getTopics = async (postId) => {
  return fetch(`${RELATED_TOPIC_API_ENDPOINT}/?post_id=${postId}`, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      return data.data;
    })
    .catch((error) => {
      console.error("APIリクエストでエラーが発生しました:", error);
    });
};
const getNotes = async (topics) => {
  const topicIds = [];
  const searchTexts = [];

  topics.forEach((item) => {
    searchTexts.push(item.label.ja);
    if (item.topicId !== null) {
      topicIds.push(item.topicId);
    }
  });

  let queryParams = "";
  if (topicIds && topicIds.length > 0) {
    queryParams =
      queryParams +
      topicIds
        .map((topicId) => {
          return `&topic_ids=${topicId}`;
        })
        .join("");
  }
  if (searchTexts && searchTexts.length > 0) {
    queryParams = queryParams + `&search_text=${searchTexts.join(",")}`;
  }
  console.log({ queryParams });
  return fetch(
    `https://birdxplorer.onrender.com/api/v1/data/notes?language=ja&current_status=CURRENTLY_RATED_HELPFUL&limit=10${queryParams}`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      return data.data;
    })
    .catch((error) => {
      console.error("APIリクエストでエラーが発生しました:", error);
    });
};
const getNotesByPostId = async (postId) => {
  return fetch(
    `https://birdxplorer.onrender.com/api/v1/data/notes?offset=0&limit=100&language=ja&post_ids=${postId}`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      return data.data;
    })
    .catch((error) => {
      console.error("APIリクエストでエラーが発生しました:", error);
    });
};
/* 画面描画系 */

const showPopup = (event) => {
  const popup = document.getElementById("popup");
  popup.style.position = "absolute";
  popup.style.top = `${event.pageY}px`;
  popup.style.left = `${event.pageX}px`;
  popup.style.display = "block";
};

const setUserAttr = (userAttr) => {
  const userData = document.getElementById("user-data");
  userData.innerHTML = "";
  userAttr.forEach((item) => {
    const div = document.createElement("div");
    div.textContent = `${item.keyword} ${item.percentage}`;
    userData.appendChild(div);
  });
};

const setNotes = (notes) => {
  const notesDiv = document.getElementById("notes");
  notesDiv.innerHTML = "";

  if (notes.length > 0) {
    notes.forEach((item) => {
      const noteDiv = document.createElement("div");
      noteDiv.style.paddingBottom = "8px";

      const linkedText = item.summary.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank">$1</a>'
      );
      noteDiv.innerHTML = linkedText;

      const topicDiv = document.createElement("div");
      topicDiv.classList.add("m-2");

      item.topics.forEach((topic) => {
        const span = document.createElement("span");
        span.classList.add("badge", "bg-primary", "text-white", "p-2", "mx-1");
        span.textContent = topic.label.ja;
        topicDiv.appendChild(span);
      });

      noteDiv.appendChild(topicDiv);
      notesDiv.appendChild(noteDiv);
    });
  } else {
    const noteDiv = document.createElement("div");
    noteDiv.textContent = "ノートがありません。🙇💦";
    notesDiv.appendChild(noteDiv);
  }
};
