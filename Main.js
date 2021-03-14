import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Todo from "./Todo.js";
import { v4 } from "uuid";
import { useStateValue } from "./StateProvider";
import { Appbar, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { actionTypes } from "./reducer";
import Notify from "./Notification.js";

function Main() {
  const [input, setInput] = useState();

  const [{ user, todos }, dispatch] = useStateValue();
  const didMountRef = useRef(false);

  //Get Indian Standard time
  const getDate = () => {
    let d = new Date();
    let ank = d.toLocaleString();
    let currentDate = /[0-9]*:[0-9]*:[0-9]*/g.exec(JSON.stringify(ank));
    let day = /[A-za-z]+ [A-za-z]+ [0-9]+/g.exec(JSON.stringify(ank));
    let year = /[0-9][0-9][0-9][0-9]/g.exec(JSON.stringify(ank));
    return `${day}  ${year}\n${currentDate}`;
  };

  //Sorting todos
  Array.prototype.sortBy = function (p) {
    return this.slice(0).sort(function (a, b) {
      return a[p] < b[p] ? 1 : a[p] > b[p] ? -1 : 0;
    });
  };
  async function _storeData(value) {
    try {
      await AsyncStorage.setItem("10~Tasks", JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  }

  //Receiving data from async storage
  async function _retrieveData() {
    try {
      const value = await AsyncStorage.getItem("10~Tasks");
      if (JSON.parse(value) !== null) {
        dispatch({
          type: actionTypes.SET_TODOS,
          todos: JSON.parse(value),
        });

        console.log(JSON.parse(value));
      } else {
        const date = getDate();
        const key = v4();
        dispatch({
          type: actionTypes.SET_TODOS,
          todos: [
            {
              key: key,
              todo: "Welcome",
              check: false,
              date: date,
              due_date: "Today",
            },
          ],
        });
        _storeData([
          {
            key: key,
            todo: "Welcome",
            check: false,
            date: date,
            due_date: "Today",
          },
        ]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  //fetching data once when the component loads
  useEffect(() => {
    _retrieveData();
  }, []);

  //Deletion of todo
  useEffect(() => {
    if (didMountRef.current) {
      const newinfo = todos.filter((todo) => todo.key !== user);
      todos && _storeData(newinfo);
      todos &&
        dispatch({
          type: actionTypes.SET_TODOS,
          todos: newinfo,
        });
    } else didMountRef.current = true;
  }, [user]);

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Todo App" subtitle={"Sanchit Anand"} />
      </Appbar.Header>

      <ScrollView style={styles.body}>
        {todos.sortBy("due_date").map((todo) => (
          <Todo key={todo.key} todo={todo} />
        ))}
      </ScrollView>
      <Notify />
      <View>
        <TextInput
          label="Add Todo"
          value={input}
          onChangeText={(text) => {
            setInput(text);
          }}
          onSubmitEditing={() => {
            const key = v4();
            const date = getDate();
            dispatch({
              type: actionTypes.SET_TODOS,
              todos: [
                ...todos,
                {
                  key: key,
                  todo: input,
                  check: false,
                  date: date,
                  due_date: "Today",
                },
              ],
            });

            _storeData([
              ...todos,
              {
                key: key,
                todo: input,
                check: false,
                date: date,
                due_date: "Today",
              },
            ]);
            setInput("");
          }}
        />
      </View>
    </View>
  );
}

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  body: {
    backgroundColor: "rgb(34,34,34)",
    paddingTop: 10,
    height: 10,
  },
  header: {
    padding: 40,
  },
});
