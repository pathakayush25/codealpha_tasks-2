class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        if (this.shouldResetScreen) return;
        
        if (this.currentOperand.length === 1 || 
            (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error') this.clear();
        
        if (this.shouldResetScreen) {
            this.currentOperand = number === '.' ? '0.' : number.toString();
            this.shouldResetScreen = false;
            return;
        }
        
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') return;
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    this.shouldResetScreen = true;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        computation = Math.round(computation * 10000000000) / 10000000000;
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    toggleSign() {
        if (this.currentOperand === 'Error' || this.currentOperand === '0') return;
        this.currentOperand = (parseFloat(this.currentOperand) * -1).toString();
    }

    calculatePercentage() {
        if (this.currentOperand === 'Error') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        
        if (this.previousOperand && this.operation && (this.operation === '+' || this.operation === '−' || this.operation === '-')) {
            const prev = parseFloat(this.previousOperand);
            this.currentOperand = ((prev * current) / 100).toString();
        } else {
            this.currentOperand = (current / 100).toString();
        }
    }

    getDisplayNumber(number) {
        if (number === 'Error') return number;
        if (number === '-' || number === '') return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            let displayOp = this.operation;
            if (displayOp === '*') displayOp = '×';
            if (displayOp === '/') displayOp = '÷';
            if (displayOp === '-') displayOp = '−';
            
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${displayOp}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

document.querySelector('.keypad').addEventListener('click', e => {
    const button = e.target.closest('.btn');
    if (!button) return;

    if (button.classList.contains('num')) {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    }
    
    if (button.classList.contains('op')) {
        let action = button.dataset.action;
        let opMap = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷'
        };
        calculator.chooseOperation(opMap[action]);
        calculator.updateDisplay();
    }

    if (button.classList.contains('fn')) {
        const action = button.dataset.action;
        if (action === 'clear') {
            calculator.clear();
        } else if (action === 'delete') {
            calculator.delete();
        } else if (action === 'toggle-sign') {
            calculator.toggleSign();
        } else if (action === 'percentage') {
            calculator.calculatePercentage();
        }
        calculator.updateDisplay();
    }

    if (button.classList.contains('eq')) {
        calculator.compute();
        calculator.updateDisplay();
    }
});

document.addEventListener('keydown', e => {
    if (e.key >= 0 && e.key <= 9 || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        calculator.chooseOperation(e.key);
        calculator.updateDisplay();
    }
    if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
    if (e.key === '%') {
        calculator.calculatePercentage();
        calculator.updateDisplay();
    }
});
