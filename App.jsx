import React from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Split from "react-split";
import { addDoc, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, notesCollection } from "./firebase";

export default function App() {
  const [notes, setNotes] = React.useState([]);
  const [tempNoteText, setTempNoteText] = React.useState();
  const [currentNoteId, setCurrentNoteId] = React.useState("");

  const currentNote =
    notes.find((note) => note.id === currentNoteId) || notes[0];

  React.useEffect(() => {
    // localStorage.setItem("notes", JSON.stringify(notes));
    const unsubscribe = onSnapshot(notesCollection, function (snapshot) {
      const notesArray = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const sortedArray = notesArray.sort((a, b) => b.updatedAt - a.updatedAt);

      setNotes(sortedArray);
    });

    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (!currentNoteId) setCurrentNoteId(notes[0]?.id);
  }, [notes]);

  React.useEffect(() => {
    notes.find((note) => {
      if (currentNote) setTempNoteText(currentNote?.body);
    });
  }, [currentNote]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tempNoteText !== currentNote?.body) updateNote(tempNoteText);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tempNoteText]);

  async function createNewNote() {
    const newNote = {
      body: "# Type your markdown note's title here",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newNoteRef = await addDoc(notesCollection, newNote);
    setCurrentNoteId(newNoteRef.id);
  }

  async function updateNote(text) {
    const docRef = doc(db, "notes", currentNoteId);
    await setDoc(
      docRef,
      { body: text, updatedAt: new Date() },
      { merge: true }
    );
  }

  async function deleteNote(noteId) {
    console.log("ds");
    const docRef = doc(db, "notes", noteId);
    await deleteDoc(docRef);
  }

  return (
    <main>
      {notes.length > 0 ? (
        <Split sizes={[30, 70]} direction="horizontal" className="split">
          <Sidebar
            notes={notes}
            currentNote={currentNote}
            setCurrentNoteId={setCurrentNoteId}
            newNote={createNewNote}
            deleteNote={deleteNote}
          />
          <Editor
            currentNote={currentNote}
            updateNote={updateNote}
            tempNoteText={tempNoteText}
            setTempNoteText={setTempNoteText}
          />
        </Split>
      ) : (
        <div className="no-notes">
          <h1>You have no notes</h1>
          <button className="first-note" onClick={createNewNote}>
            Create one now
          </button>
        </div>
      )}
    </main>
  );
}
