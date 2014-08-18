//=================== one-level directives ================================
angular.module('ng').directive('bullshitButton', function($rootScope) {
	return {
		restrict: 'E',
		transclude: true,
		scope: { bullshitButtonSetClass: '@' },
		controller: function($scope) {
			$scope.buttonText = 'elemMain';
			$scope.buttonClass = 'btn-default';
			$scope.bondDidWhat = 'did nada';
			this.setButtonText = function(value) {
				$scope.buttonText = value;
			};
			this.setButtonClass = function(value) {
				$scope.buttonClass = 'btn-' + value;
			};
			this.setJamesBondText = function(value) {
				$scope.bondDidWhat = value;
			};
		},
		link: function(scope, element, attrs) {
			// so the point here is that $rootScope.$broadcast is heard by everyone
			scope.$on('broadcastTestMessage', function (event, message) {
				$rootScope.$broadcast('simple-console-log', "Even fucking James Bond received message: " + message + "... Scroll up to bullshit button directive");
				scope.bondDidWhat = "heard the message (" + message + ") afterall... he is a spy..."
			});
		},
		template: '<button class="btn" ng-class="buttonClass">{{ buttonText }}</button>'
			+ '<br/><span>Great spy, James Bond, {{ bondDidWhat }}</span>'
	};
});
angular.module('ng').directive('bullshitButtonSetText', function() {
	return {
		require: 'bullshitButton',
		restrict: 'A',
		link: function(scope, element, attrs, elemMainCtrlSuddenlyAvailable) {
			elemMainCtrlSuddenlyAvailable.setButtonText('text overwritten by bullshitButtonSetText');
		},
	};
});
angular.module('ng').directive('bullshitButtonSetClass', function() {
	return {
		require: 'bullshitButton',
		restrict: 'A',
		// setting both scope here and scope in bullshitButton directive throws an error:
		// Multiple directives [bullshitButton, bullshitButtonSetClass] asking for isolated scope on...
		// That's why it is commented out here and we need to use a $watch on scope.bullshitButtonSetClass
		//scope: { bullshitButtonSetClass: '@' },
		link: function(scope, element, attrs, elemMainCtrlSuddenlyAvailable) {
			elemMainCtrlSuddenlyAvailable.setButtonClass(scope.bullshitButtonSetClass);
			scope.$watch("bullshitButtonSetClass", function (nv) {
				elemMainCtrlSuddenlyAvailable.setButtonClass(nv);
			});
		},
	};
});
angular.module('ng').directive('bullshitButtonIncrementBondKills', function() {
	return {
		require: 'bullshitButton',
		restrict: 'A',
		link: function(scope, element, attrs, elemMainCtrlSuddenlyAvailable) {
			scope.bondKills = 0;
			element.find('button').click(function () {
				scope.$apply(function () {
					scope.bondKills++;
					elemMainCtrlSuddenlyAvailable.setJamesBondText('killed ' + scope.bondKills + ' baddies with his WPPK');
				});
			});
		},
	};
});

//=================== multi-level directives ================================
angular.module('ng').directive('myTabs', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {},
		controller: function($scope) {
			var panes = $scope.panes = [];

			$scope.select = function(pane) {
				angular.forEach(panes, function(pane) {
					pane.selected = false;
				});
				pane.selected = true;
			};
			
			this.addPane = function(pane) {
				if (panes.length === 0) {
					$scope.select(pane);
				}
				panes.push(pane);
			};
		},
		template: '<div class="tabbable">'
			+ '  <ul class="nav nav-tabs">'
			+ '    <li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'
			+ '      <a href="" ng-click="select(pane)">{{pane.title}}</a>'
			+ '    </li>'
			+ '  </ul>'
			+ '  <div class="tab-content" ng-transclude></div>'
			+ '</div>'
	};
});
angular.module('ng').directive('myPane', function() {
	return {
		require: '^myTabs',
		restrict: 'E',
		transclude: true,
		scope: {
			title: '@'
		},
		link: function(scope, element, attrs, tabsCtrl) {
			tabsCtrl.addPane(scope);
		},
		template: '<div class="tab-pane" ng-show="selected" ng-transclude></div>'
	};
});

//=================== service-sharing directives ================================
// first we create a factory, or service... call it whatever you want
angular.module('ng').factory('myOwnServiceGodILoveDependencyInjection', ['$rootScope', function ($rootScope) {
	function MySharedObj() {
		var self = this;
		self.secretText = 'not yet set';
		self.listeners = [];
		self.register = function (who) {
			self.listeners.push(who);
		};
		self.fart = function () {
			$.each(self.listeners, function (i, x) {
				x.farted();
			});
		};
		self.burp = function () {
			$.each(self.listeners, function (i, x) {
				x.burped();
			});
		};
	}
	return new MySharedObj();
}]);
// these are listening directives, so they need to register with our service
angular.module('ng').directive('collectorOfFarts', ['myOwnServiceGodILoveDependencyInjection', function(myOwnServiceGodILoveDependencyInjection) {
	return {
		restrict: 'A',
		template: 'Hello I am a collector of farts (god I hate this job): {{ farts }}',
		link: function(scope, element, attrs) {
			myOwnServiceGodILoveDependencyInjection.register({
				burped: function () {},
				farted: function () {
					scope.farts += '0';
				}
			});
			scope.farts = '';
		}
	};
}]);
angular.module('ng').directive('collectorOfBurps', ['myOwnServiceGodILoveDependencyInjection', function(myOwnServiceGodILoveDependencyInjection) {
	return {
		restrict: 'A',
		template: 'Hello I am a collector of burps: {{ burps }}',
		link: function(scope, element, attrs) {
			myOwnServiceGodILoveDependencyInjection.register({
				burped: function () {
					scope.burps += '0';
				},
				farted: function () {}
			});
			scope.burps = '';
		}
	};
}]);
// and this directive will pull the strings on the service, invoking something in the listeners
angular.module('ng').directive('grossBoyHeCanBurpAndFart', ['myOwnServiceGodILoveDependencyInjection', function(myOwnServiceGodILoveDependencyInjection) {
	return {
		restrict: 'A',
		template: 'Hello I am a gross boy... I can '
			+ '<button class="btn btn-success" ng-click="funcBurp()">burp</button> '
			+ '<button class="btn btn-warning" ng-click="funcFart()">fart</button> '
			+ 'so let\'s play this sick game! Ugh!',
		link: function(scope, element, attrs) {
			scope.funcBurp = function () {
				myOwnServiceGodILoveDependencyInjection.burp();
			};
			scope.funcFart = function () {
				myOwnServiceGodILoveDependencyInjection.fart();
			};
		}
	};
}]);

//=================== $broadcast-ing directives ================================
angular.module('ng').directive('broadcastTest', function($rootScope) {
	return {
		restrict: 'E',
		transclude: true,
		template: '<div class="clearfix">'
			+ '<span>{{ title }}: </span><br/>'
			+ '<button class="btn btn-info" ng-click="funcBroadcast(valueBroadcast)">scope.$broadcast</button>'
			+ '(<input type="text" ng-model="valueBroadcast" ng-init="valueBroadcast=\'aaa\'" />)<br/>'
			+ '<button class="btn btn-success" ng-click="funEmit(valueEmit)">scope.$emit</button>'
			+ '(<input type="text" ng-model="valueEmit" ng-init="valueEmit=\'bbb\'" />)<br/>'
			+ '<button class="btn btn-danger" ng-click="funcRootBroadcast(valueRoot)">$rootScope.$broadcast</button>'
			+ '(<input type="text" ng-model="valueRoot" ng-init="valueRoot=\'ccc\'" />)<br/>'
			+ '</div><div class="clearfix">ng-transcluded below: (the $broadcast will not travel to child-level-1 because of transclusion. See diagram)</div>'
			+ '<div class="nest-children" ng-transclude></div>',
		scope: { 'title': '@' },
		link: function(scope, element, attrs) {
			scope.funcBroadcast = function (message) {
				scope.$broadcast('broadcastTestMessage', message);
			};
			scope.funEmit = function (message) {
				scope.$emit('broadcastTestMessage', message);
			};
			scope.funcRootBroadcast = function (message) {
				$rootScope.$broadcast('broadcastTestMessage', message);
			};
			var unreg1 = scope.$on('broadcastTestMessage', function (event, message) {
				$rootScope.$broadcast('simple-console-log', scope.title + " received message: " + message);
			});
			// dont forget to unregister all the $on's
			var unreg2 = scope.$on('$destroy', function () {
				unreg1();
				unreg2();
			});
		}
	};
});
angular.module('ng').directive('broadcastTestChild1', function($rootScope) {
	return {
		restrict: 'E',
		template: '<div class="clearfix">'
			+ '<span>child-level-1: </span><br/>'
			+ '<button class="btn btn-info" ng-click="funcBroadcast(valueBroadcast)">scope.$broadcast</button>'
			+ '(<input type="text" ng-model="valueBroadcast" ng-init="valueBroadcast=\'aaa\'" />)<br/>'
			+ '<button class="btn btn-success" ng-click="funEmit(valueEmit)">scope.$emit</button>'
			+ '(<input type="text" ng-model="valueEmit" ng-init="valueEmit=\'bbb\'" />)<br/>'
			+ '<button class="btn btn-danger" ng-click="funcRootBroadcast(valueRoot)">$rootScope.$broadcast</button>'
			+ '(<input type="text" ng-model="valueRoot" ng-init="valueRoot=\'ccc\'" />)<br/>'
			+ '</div><div class="nest-children"><broadcast-test-child-2></broadcast-test-child-2></div>',
		scope: {},  // must have this to have isolate scope,
					// otherwise this and broadcast-test-child-2's scopes will be the same scope
		link: function(scope, element, attrs) {
			scope.funcBroadcast = function (message) {
				scope.$broadcast('broadcastTestMessage', message);
			};
			scope.funEmit = function (message) {
				scope.$emit('broadcastTestMessage', message);
			};
			scope.funcRootBroadcast = function (message) {
				$rootScope.$broadcast('broadcastTestMessage', message);
			};
			var unreg1 = scope.$on('broadcastTestMessage', function (event, message) {
				$rootScope.$broadcast('simple-console-log', "child-level-1 received message: " + message);
			});
			// dont forget to unregister all the $on's
			var unreg2 = scope.$on('$destroy', function () {
				unreg1();
				unreg2();
			});
		}
	};
});
angular.module('ng').directive('broadcastTestChild2', function($rootScope) {
	return {
		restrict: 'E',
		template: '<div class="clearfix">'
			+ '<span>child-level-2: </span><br/>'
			+ '<button class="btn btn-info" ng-click="funcBroadcast(valueBroadcast)">scope.$broadcast</button>'
			+ '(<input type="text" ng-model="valueBroadcast" ng-init="valueBroadcast=\'aaa\'" />)<br/>'
			+ '<button class="btn btn-success" ng-click="funEmit(valueEmit)">scope.$emit</button>'
			+ '(<input type="text" ng-model="valueEmit" ng-init="valueEmit=\'bbb\'" />)<br/>'
			+ '<button class="btn btn-danger" ng-click="funcRootBroadcast(valueRoot)">$rootScope.$broadcast</button>'
			+ '(<input type="text" ng-model="valueRoot" ng-init="valueRoot=\'ccc\'" />)<br/>'
			+ '</div>',
		scope: {},  // must have this to have isolate scope,
					// otherwise this and broadcast-test-child-1's scopes will be the same scope
		link: function(scope, element, attrs) {
			scope.funcBroadcast = function (message) {
				scope.$broadcast('broadcastTestMessage', message);
			};
			scope.funEmit = function (message) {
				scope.$emit('broadcastTestMessage', message);
			};
			scope.funcRootBroadcast = function (message) {
				$rootScope.$broadcast('broadcastTestMessage', message);
			};
			var unreg1 = scope.$on('broadcastTestMessage', function (event, message) {
				$rootScope.$broadcast('simple-console-log', "child-level-2 received message: " + message);
			});
			// here we are going to register $rootscope listener to prove that $emit travels up
			// it doesn't matter where we register it, as long as it is registered once somewhere.
			var unreg2 = $rootScope.$on('broadcastTestMessage', function (event, message) {
				$rootScope.$broadcast('simple-console-log', "$rootScope received message: " + message);
			});
			// dont forget to unregister all the $on's
			var unreg3 = scope.$on('$destroy', function () {
				unreg1();
				unreg2();
				unreg3();
			});
		}
	};
});

// listens for $broadcast of 'simple-console-log' and 'simple-console-dump'
angular.module('ng').directive('simpleConsole', function() {
	return {
		restrict: 'E',
		template: '<br/><br/>'
			+ '<button class="btn">Clear Console</button>'
			+ '<div class="logpanel" style="white-space:pre"></div>',
		link: function(scope, element, attrs) {
			var iiii = 0;
			element.find("button").bind('click', function (e) {
				element.find(".logpanel").html('');
			});
			function appendMessage(message) {
				element.find(".logpanel").append((++iiii) + ". " + message + "\n");
			}
			// note that everyone can hear the $rootScope broadcasts
			var unreg1 = scope.$on('simple-console-log', function (event, text) {
				appendMessage(text);
			});
			var unreg2 = scope.$on('simple-console-dump', function (event, obj) {
				var out = 'Object dump:\n';
				for (var i in obj) {
					out += "  ---> " + i + " => " + obj[i] + "\n";
				}
				appendMessage(out);
			});
			// dont forget to unregister all the $on's
			var unreg3 = scope.$on('$destroy', function () {
				unreg1();
				unreg2();
				unreg3();
			});
		}
	};
});
