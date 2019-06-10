"use strict";
import { splitAST, Syntax as SentenceSyntax } from "sentence-splitter";
import StringSource from "textlint-util-to-string";

module.exports = function(context, options = {}) {
  const { Syntax, RuleError, report, getSource } = context;

  const periodOrCamma = ["。", "、", ".", ","];

  const checkPeriodAtEndOfNodeContent = sentence => {
    const matches = /\((注:.*?)\)/g.exec(sentence);

    if (!matches) {
      return;
    }

    const endOfNoteContent = matches[1][matches[1].length - 1];
    const indexOfBugs = matches.index;
    if (!periodOrCamma.includes(endOfNoteContent)) {
      return new RuleError(`注釈文の終わりに句読点がありません`, {
        index: indexOfBugs
      });
    }
  };

  let prevSentence;
  const checkNotPeriodAtLastCharWhereNoteStarts = sentence => {
    const matches = /(.)\(注:.*?\)/g.exec(prevSentence + sentence);
    prevSentence = sentence;

    if (!matches) {
      return;
    }
    const lastCharWhereNoteStarts = matches[1];
    const indexOfBugs = matches.index;
    if (periodOrCamma.includes(lastCharWhereNoteStarts)) {
      return new RuleError(`注釈文の括弧前に句読点があります`, {
        index: indexOfBugs
      });
    }
  };

  return {
    [Syntax.Paragraph](node) {
      const errors = [];

      const pushError = error => {
        if (error) {
          errors.push(error);
        }
      };

      const paragraph = splitAST(node);
      paragraph.children
        .filter(sentence => sentence.type === SentenceSyntax.Sentence)
        .forEach((sentence, idx) => {
          const source = new StringSource(sentence);
          const sentenceText = source.toString();

          pushError(checkPeriodAtEndOfNodeContent(sentenceText));
          pushError(checkNotPeriodAtLastCharWhereNoteStarts(sentenceText));
        });

      errors.forEach(error => {
        report(node, error);
      });
    }
  };
};
