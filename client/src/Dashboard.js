import { useState, useEffect } from 'react';
import './App.css';

// Define the AST evaluation functions
const evaluateAST = (ast, data) => {
  if (ast.type === 'condition') {
    console.log(ast.value);

    let r = evalCondition(ast.value, data);
    console.log(r);
    console.log(' ');
    return r;
  }

  const left = evaluateAST(ast.left, data);
  const right = evaluateAST(ast.right, data);

  if (ast.type === 'AND') {
    return left && right;
  } else if (ast.type === 'OR') {
    return left || right;
  }

  return false;
};

const evalCondition = (condition, data) => {
  // Use a regex to match the field, operator, and value
  const match = condition.match(/^(\w+)\s*(==|!=|<=|>=|<|>)\s*(.+)$/);

  console.log('Condition:', condition);

  if (!match) {
    throw new Error(`Invalid condition: ${condition}`);
  }

  const [, field, operator, value] = match;

  console.log('Field:', field, 'Operator:', operator, 'Value:', value);

  // Determine whether the value is numeric or a string and evaluate it accordingly
  let formattedValue = value.trim();

  if (isNaN(formattedValue)) {
    let originalString = formattedValue;
    formattedValue = `"${originalString.replace(/'/g, '')}"`;
  }

  // Convert the data field to a string if it's not a number, and compare it correctly
  const dataValue = isNaN(data[field])
    ? JSON.stringify(data[field])
    : data[field];

  // Log for debugging

  console.log(
    'Data Field Value:',
    dataValue,
    'Formatted Value:',
    formattedValue
  );

  return eval(`${dataValue} ${operator} ${formattedValue}`);
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [rules, setRules] = useState([]);
  const [rulegroup, group] = useState('');
  //  const [selectedRules, setSelectedRules] = useState([]);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState(null);
   const [rule, setRule] = useState("");
  const [age, setAge] = useState('');
  const [department, setDepartment] = useState('');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('');
  const [errors, setErrors] = useState({
    rule: '',
    age: '',
    department: '',
    salary: '',
    experience: '',
    selectedRule: '',
  });

  const [grouperrors, setgroupErrors] = useState('');
  //const [selectedRule, setSelectedRule] = useState("");

  useEffect(() => {
    if (activeTab === 'evaluate') {
      fetchRules();
    }
  }, [activeTab]);

  const fetchRules = () => {
    fetch('http://localhost:5556/rules')
      .then((response) => response.json())
      .then((rulesArray) => {
        setRules(rulesArray);
      })
      .catch((error) => {
        console.error('Error fetching rules:', error);
      });
  };

  // combine rule section
  const validate_combine_Rules = () => {
    //alert("paritosh");
    let valid = true;
    let newErrors = '';

    if (rulegroup.trim() === '') {
      valid = false;
      newErrors = 'Rule cannot be empty.';
    } else if (rulegroup.length < 50) {
      valid = false;
      newErrors = 'Rule must be at least 50 characters long.';
    } else if (!/AND|OR/.test(rulegroup)) {
      valid = false;
      newErrors = "Rule must contain at least one 'AND' or 'OR' operator.";
    } else {
      newErrors = '';
    }

    setgroupErrors(newErrors);
    console.log(valid);
    if (valid) {
      if (rulegroup.trim() === '') {
        setgroupErrors({ rule: 'Please enter at least one rule.' });
        return;
      }
      
      // Split the rules by commas and trim spaces
      const rulesArray = rulegroup.split(',').map((r) => r.trim());
      
      submitRules(rulesArray);
    }
  };




  const validateRule = () => {
    let valid = true;
    let newErrors = { ...errors };

    if (rule.trim() === '') {
      valid = false;
      newErrors.rule = 'Rule cannot be empty.';
    } else if (rule.length < 50) {
      valid = false;
      newErrors.rule = 'Rule must be at least 50 characters long.';
    } else if (!/AND|OR/.test(rule)) {
      valid = false;
      newErrors.rule = "Rule must contain at least one 'AND' or 'OR' operator.";
    } else {
      newErrors.rule = '';
    }

    setErrors(newErrors);

    if (valid) {
      let temp = [];
      temp.push(rule);
      submitRules(temp); // Call submitRules function to send the new rulegroup
    }
  };

  const submitRules = (array) => {
    const url = 'http://localhost:5556/rules';
    //console.log(selectedRules);
    const newRule = {
      rule: array
    };
    console.log(array.length);
    const postdata = {
      headers: { 'Content-type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(newRule),
    };

    fetch(url, postdata)
      .then((response) => response.json())
      .then((data) => {
      console.log(data.ast);
        alert('Root Node: ' + data.ast.type + '   Rule Added Successfully!');
      })
      .catch((error) => {
        console.error('Error submitting rule:', error);
      });
  };

  const handleRuleSelection = (index) => {
    setSelectedRuleIndex(index);
  };

  // evalution section

  const validateEvaluation = () => {
    let valid = true;
    let newErrors = { ...errors };

    if (age.trim() === '' || isNaN(age)) {
      valid = false;
      newErrors.age = 'Age must be a number and cannot be empty.';
    } else {
      newErrors.age = '';
    }

    if (department.trim() === '') {
      valid = false;
      newErrors.department = 'Department cannot be empty.';
    } else {
      newErrors.department = '';
    }

    if (salary.trim() === '' || isNaN(salary)) {
      valid = false;
      newErrors.salary = 'Salary must be a number and cannot be empty.';
    } else {
      newErrors.salary = '';
    }

    if (experience.trim() === '' || isNaN(experience)) {
      valid = false;
      newErrors.experience = 'Experience must be a number and cannot be empty.';
    } else {
      newErrors.experience = '';
    }

    if (selectedRuleIndex == null) {
      valid = false;
      newErrors.selectedRule = 'Please select a rule.';
    } else {
      newErrors.selectedRule = '';
    }

    setErrors(newErrors);

    if (valid) {
      getAST();
    }
  };

  const getAST = () => {
    // Ensure a rule is selected
    if (selectedRuleIndex === null) {
      alert('Please select a rule.');
      return;
    }

    // Retrieve the selected rule from the rules array using the index
    const selectedRule = rules[selectedRuleIndex];

    // Extract the AST directly from the selected rule
    const ast = selectedRule.ast;

    // Prepare the evaluation data
    const evaluationData = {
      age,
      department,
      salary,
      experience,
    };

    // Call the evaluateAST function with the AST and evaluation data
    const result = evaluateAST(ast, evaluationData);

    // Handle the evaluation result (e.g., display a message or update the UI)
    alert(`Evaluation Result: ${result ? 'True' : 'False'}`);
  };

  return (
    <section className="bg-light py-5">
      <div className="container">
        <div className="row mb-4">
          <div className="col-lg-12 text-center fs-2 fw-bold text-dark">
            Rules & Eligibility
          </div>
        </div>
  
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <div className="btn-group mb-4">
            <button
  className={`btn ${
    activeTab === 'create' ? 'btn-dark' : 'btn-outline-dark'
  } fw-bold rounded-pill px-4 me-2`}
  onClick={() => setActiveTab('create')}
>
  Create Rule
</button>
<button
  className={`btn ${
    activeTab === 'combine' ? 'btn-dark' : 'btn-outline-dark'
  } fw-bold rounded-pill px-4 me-2`}
  onClick={() => setActiveTab('combine')}
>
  Combine Rules
</button>
<button
  className={`btn ${
    activeTab === 'evaluate' ? 'btn-dark' : 'btn-outline-dark'
  } fw-bold rounded-pill px-4`}
  onClick={() => {
    setActiveTab('evaluate');
    fetchRules();
  }}
>
  Evaluate Rules
</button>

            </div>
          </div>
        </div>
  
        <div className="row justify-content-center gap">
          <div className="col-lg-8">
            <div className="card shadow-sm p-4 bg-white border-0 rounded-3">
              <h3 className="text-center text-secondary mb-4">
                {activeTab === 'create' && 'Create Rule'}
                {activeTab === 'combine' && 'Combine Rules'}
                {activeTab === 'evaluate' && 'Evaluate Rules'}
              </h3>
  
              <div>
                {activeTab === 'create' && (
                  <form>
                    <div className="mb-3">
                      <textarea
                        className={`form-control rounded-3 shadow-sm p-3 ${
                          errors.rule ? 'is-invalid' : ''
                        }`}
                        placeholder="Enter Rule"
                        value={rule}
                        onChange={(e) => setRule(e.target.value)}
                        rows={6}
                      ></textarea>
                      {errors.rule && (
                        <small className="text-danger fst-italic">
                          <i>{errors.rule}</i>
                        </small>
                      )}
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-dark px-5 fw-bold rounded-pill"
                        onClick={validateRule}
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                )}
  
                {activeTab === 'combine' && (
                  <form>
                    <h5 className="text-secondary mb-3">
                      Write rules and separate them by commas
                    </h5>
                    <div className="mb-3">
                      <textarea
                        className={`form-control rounded-3 shadow-sm p-3 ${
                          errors.rule ? 'is-invalid' : ''
                        }`}
                        placeholder="Enter rules separated by commas"
                        value={rulegroup}
                        onChange={(e) => group(e.target.value)}
                        rows={6}
                      ></textarea>
                      {grouperrors && (
                        <div className="text-danger">{grouperrors}</div>
                      )}
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-dark px-5 fw-bold rounded-pill"
                        onClick={validate_combine_Rules}
                      >
                        Combine
                      </button>
                    </div>
                  </form>
                )}
  
                {activeTab === 'evaluate' && (
                  <form>
                    <div className="row mb-3">
                      <div className="col-lg-6 mb-3">
                        <label className="form-label fw-bold text-secondary">
                          Age
                        </label>
                        <input
                          type="number"
                          className={`form-control shadow-sm rounded-3 ${
                            errors.age ? 'is-invalid' : ''
                          }`}
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                        />
                        {errors.age && (
                          <small className="text-danger fst-italic">
                            <i>{errors.age}</i>
                          </small>
                        )}
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label className="form-label fw-bold text-secondary">
                          Department
                        </label>
                        <input
                          type="text"
                          className={`form-control shadow-sm rounded-3 ${
                            errors.department ? 'is-invalid' : ''
                          }`}
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                        />
                        {errors.department && (
                          <small className="text-danger fst-italic">
                            <i>{errors.department}</i>
                          </small>
                        )}
                      </div>
                    </div>
  
                    <div className="row mb-3">
                      <div className="col-lg-6 mb-3">
                        <label className="form-label fw-bold text-secondary">
                          Salary
                        </label>
                        <input
                          type="number"
                          className={`form-control shadow-sm rounded-3 ${
                            errors.salary ? 'is-invalid' : ''
                          }`}
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                        />
                        {errors.salary && (
                          <small className="text-danger fst-italic">
                            <i>{errors.salary}</i>
                          </small>
                        )}
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label className="form-label fw-bold text-secondary">
                          Experience
                        </label>
                        <input
                          type="number"
                          className={`form-control shadow-sm rounded-3 ${
                            errors.experience ? 'is-invalid' : ''
                          }`}
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                        />
                        {errors.experience && (
                          <small className="text-danger fst-italic">
                            <i>{errors.experience}</i>
                          </small>
                        )}
                      </div>
                    </div>
  
                    {rules.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label fw-bold text-secondary">
                          Select the rule by which you want to evaluate:
                        </label>
                        {rules.map((rule, index) => (
                          <div key={index} className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              value={index}
                              checked={selectedRuleIndex === index}
                              onChange={() => handleRuleSelection(index)}
                            />
                            <label className="form-check-label">{rule.rule}</label>
                          </div>
                        ))}
  
                        {errors.selectedRule && (
                          <small className="text-danger fst-italic">
                            <i>{errors.selectedRule}</i>
                          </small>
                        )}
                      </div>
                    )}
  
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-dark px-5 fw-bold rounded-pill"
                        onClick={validateEvaluation}
                      >
                        Evaluate
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
};

export default Dashboard;


