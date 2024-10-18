const express = require('express');
const router = express.Router();
const Rule = require('../schema/ruleschema');

// Fetch all rules
router.get('/', async (req, res) => {
  try {
    const ruleList = await Rule.find();
    res.status(200).json(ruleList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rules', error: 'YES' });
  }
});

class ASTNode {
  constructor(type, value = null) {
    this.type = type;
    this.value = value;
    this.left = null;
    this.right = null;
  }

  toJSON() {
    return {
      type: this.type,
      value: this.value,
      left: this.left ? this.left.toJSON() : null,
      right: this.right ? this.right.toJSON() : null,
    };
  }
}

function parseRuleToAST(rule) {
  const tokens = tokenize(rule);
  let index = 0;

  function tokenize(rule) {
    return rule.match(/AND|OR|\(|\)|[^\s()]+/g);
  }

  function parseExpression() {
    let node = parseTerm();
    while (index < tokens.length && (tokens[index] === 'AND' || tokens[index] === 'OR')) {
      const operator = tokens[index++];
      const rightNode = parseTerm();
      const newNode = new ASTNode(operator);
      newNode.left = node;
      newNode.right = rightNode;
      node = newNode;
    }
    return node;
  }

  function parseTerm() {
    if (tokens[index] === '(') {
      index++;
      const node = parseExpression();
      index++;
      return node;
    } else {
      return parseFactor();
    }
  }

  function parseFactor() {
    let condition = '';
    while (index < tokens.length && tokens[index] !== 'AND' && tokens[index] !== 'OR' && tokens[index] !== ')') {
      condition += tokens[index++] + ' ';
    }
    return new ASTNode('condition', condition.trim().replace(/=/g, '=='));
  }

  return parseExpression();
}

function combineRules(rules) {
  const asts = rules.map(parseRuleToAST);

  function findCommonSubtrees(ast1, ast2) {
    if (!ast1 || !ast2) return null;
    if (ast1.type === 'condition' && ast2.type === 'condition' && ast1.value === ast2.value) return ast1;
    if (ast1.type === ast2.type && (ast1.type === 'AND' || ast1.type === 'OR')) {
      const leftCommon = findCommonSubtrees(ast1.left, ast2.left);
      const rightCommon = findCommonSubtrees(ast1.right, ast2.right);
      if (leftCommon || rightCommon) {
        const commonNode = new ASTNode(ast1.type);
        commonNode.left = leftCommon || ast1.left;
        commonNode.right = rightCommon || ast1.right;
        return commonNode;
      }
    }
    return null;
  }

  function combineTwoASTs(ast1, ast2) {
    const commonSubtree = findCommonSubtrees(ast1, ast2);
    if (commonSubtree) return commonSubtree;
    const combinedAST = new ASTNode('AND');
    combinedAST.left = ast1;
    combinedAST.right = ast2;
    return combinedAST;
  }

  let combinedAST = asts[0];
  for (let i = 1; i < asts.length; i++) {
    combinedAST = combineTwoASTs(combinedAST, asts[i]);
  }

  return combinedAST;
}

router.post('/', async (req, res) => {
  try {
    const rules_set = req.body.rule;
    const ast = combineRules(rules_set);

    const newRule = new Rule({
      rule: rules_set,
      ast: ast,
    });

    const info = await newRule.save();
    res.status(201).json({
      message: 'Rule saved successfully',
      error: 'NO',
      ast: ast.toJSON(),
    });
  } catch (error) {
    console.error('Error saving rule:', error);
    res.status(500).json({ message: 'Error saving rule', error: 'YES' });
  }
});

module.exports = router;
