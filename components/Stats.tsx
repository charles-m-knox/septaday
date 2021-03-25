import React, { useState } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
// import { Ionicons } from '@expo/vector-icons';
// import { Entypo } from '@expo/vector-icons';
import { Task } from '../models/Task';
import * as SQLite from 'expo-sqlite';
import { getQueriesFromDB, getTaskStatsSQL, getTaskDaysSQL } from '../sqlite/sqlite';
import { getHumanDate } from '../helpers/helpers';

const Stats = ({ db, dates, completions }: {
  db: SQLite.WebSQLDatabase,
  dates: number[],
  completions: number[],
}): JSX.Element => {

  const getCompletions = (completions: number[]): number => {
    if (!completions || completions.length === 0) return 0;
    // return completions.length;
    return completions.reduce((accumulator: number, current: number): number => {
      return accumulator + current;
    });
  }

  const getCompletionsSummary = (completions: number[]): string => {
    const completionsSum = getCompletions(completions);
    const completionsPercentage = ((completionsSum / completions.length) * 100).toFixed(2);
    return `${completionsSum}/${completions.length} (${completionsPercentage}%)`;
  }

  React.useEffect(() => {
    return () => { }
  }, [])

  return (
    <View style={styles.container}>
      <View>
        <Text
          style={styles.aboutText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)">
          You have completed {getCompletionsSummary(completions)} tasks over a span of {dates.length} day{dates.length === 1 ? '' : 's'}. {dates && dates.length ? `Your journey to leading a more successful life started on ${getHumanDate(dates[0])}.` : ''}
        </Text>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "66%",
    width: "66%",
  },
  aboutText: {
    textAlign: 'left',
  },
  actionContainer: {
    marginTop: 15,
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpText: {
    textAlign: 'left',
  },
});

export default Stats;
