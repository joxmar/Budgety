// Budget Controller
var budgetController = (function(){
	// expenses constructor
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome){
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);			
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	// Incomes contructor
	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(cur){
			sum += cur.value;
		});
		data.totals[type] = sum;
	}

	//  here wiill save all the expenses and incomes data
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	// public methods MEANING available globaly
	return {
		// here is where we will push each new item with a function
		addItem: function(type, des, val){
			var newItem; // declared the new item variable

			/* Below We add an unique id,  the way to do this properly is by getting the amount of items inside
			 exp or inc and get the last item - 1 becuase remember that arrays start with 0 */
			 if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
			} else {
				ID = 0;
			}
			
			// Create new item based on inc or exp
			if (type === 'exp') { 
				newItem = new Expense(ID, des, val)
			} else if(type === 'inc'){ 
				newItem = new Income(ID, des, val)				
			}

			data.allItems[type].push(newItem); //now lets push the new item into it's correct place in the data
			return newItem; // make the new item publcly available
		},

		deleteItem: function(type, id){
				var ids, index
				// we need to map the exp /inc arrays to find the position of the correct id to be removed
				ids = data.allItems[type].map(function(current){
					return current.id;
				});

				index = ids.indexOf(id);

				if (index !== -1) {
					data.allItems[type].splice(index, 1); // start removing elements from indx and 1 would be the amount of items to remove
				}
		},

		calculateBudget: function(){
			// calcaulate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;	
			
			// calculate the percentage of income that we spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);				
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function(){
			// calculate exoense percentage
			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function(){
			var allPerc = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});

			return allPerc;
		},

		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		testing: function(){
			console.log(data);
		}
	};
})();

// UI controlers
var UIController = (function(){
	/* DOMStrings will hold the class names of the UI elements, this way if the site is 
		redesigned and the elements class names changes we can jus update the names on 
		this object
	*/
	var DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	}

	var formatNumber = function(num, type){
		var numSplit, int, dec, type;
		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');
		int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}
		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};

	var nodeListForEach = function(list, callback){
		for (var i = 0; i < list.length; i++){
			callback(list[i], i);
		}
	};

	// public methods MEANING available globaly
	return {
		getInput: function(){
			return {
				type : document.querySelector(DOMStrings.inputType).value, // either income 0r expense
				description : document.querySelector(DOMStrings.inputDescription).value,
				value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
			}			
		},

		addListItem: function(obj, type){
			var html, newHtml, element;
				// create html string with placehold
				if (type === 'inc') {
					element = DOMStrings.incomeContainer;
					html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
				} else if (type === 'exp'){
					element = DOMStrings.expensesContainer;
					html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
				}

				// replace placehold text with data from object
				newHtml = html.replace('%id%', obj.id);
				newHtml = newHtml.replace('%description%', obj.description);
				newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

				// insert HTML into the DOM
				console.log(element)
				document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListiItem: function(selectorID,){
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function(){
			var fields, fieldsArray;
			fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
			fieldsArray = Array.prototype.slice.call(fields);

			fieldsArray.forEach(function(current, index, array){
				current.value = '';
			});
			fieldsArray[0].focus();
		},
		displayBudget : function(obj){
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
		},
		displayPercentages: function(percentages){
			var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

			nodeListForEach(fields, function(current, index){
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';					
				}
			});
		},

		displayMonth: function(){
			var now, year, months, month;
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		changedTpe: function(){
			var fields = document.querySelectorAll(
				DOMStrings.inputType + ',' +
				DOMStrings.inputDescription + ',' +
				DOMStrings.inputValue
			);

			nodeListForEach(fields, function(cur){
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
		},

		getDOMStrings: function(){ // let's make DOMStrings available globaly so we can keep adding more UI classes
			return DOMStrings;
		}
	}
})();

//  Global app controler
var controller = (function(budgetCtrl, UICtrl){

	var setUpEventListeners = function (){
		var DOM = UICtrl.getDOMStrings(); // get UI's DOMStrings to add more element Classes
		
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
	
		document.addEventListener('keypress', function(event){
			if(event.keyCode === 13 || event.which === 13){ // if enter key is pressed. 'which' is for older browsers
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedTpe)
	}

	var updateBudget = function() {
		// 1. Calculate budget
		budgetCtrl.calculateBudget();

		// 2. Returns the budget
		var budget = budgetCtrl.getBudget();
		
		// 3. display budget on UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function(){
		// 1 calculate percentages
		budgetCtrl.calculatePercentages();

		// 2 read percentages from budget controller
		var percentages = budgetCtrl.getPercentages();

		// 3 update UI with new percentages
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function(){
		// 1. get fields input data: type, despcription and value
		var input = UIController.getInput();

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			// 2. add item to budget control
			var newItem = budgetController.addItem(input.type, input.description, input.value);
			// 3. add the new item to UI
			UICtrl.addListItem(newItem, input.type);
			// 4. Clear the fields
			UICtrl.clearFields();
			// 5 calculate and update budget
			updateBudget();
			// 6 calculate and update percentages
			updatePercentages();
		}
	}

	var ctrlDeleteItem = function(event){
		var itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {				
				splitID = itemID.split('-');
				type = splitID[0];
				ID = parseInt(splitID[1]);

				// 1 delete item from data structure
				budgetCtrl.deleteItem(type, ID);
				// 2 delete item from UI
				UICtrl.deleteListiItem(itemID);
				// 3 update and show the new budget
				updateBudget();
		}
	}

	// public methods MEANING available globaly
	return {
		init: function(){
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});			
			setUpEventListeners();
		}
	}
})(budgetController, UIController);

controller.init();
