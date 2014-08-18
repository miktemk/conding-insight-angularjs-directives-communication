[View the original tutorial here](http://www.codinginsight.com/angularjs-directives/ "Permalink to AngularJS directives - Coding Insight")

# AngularJS directives - Coding Insight

One cool feature of&nbsp;[AngularJS][1]&nbsp;is that it allows you to create custom HTML elements. You can achieve this by writing directives which are invoked when a certain DOM element is created. In other words, you get to intoduce your own HTML elements and attributes. Before we jump into the code, however, here are 4 different types of restrictions that you can apply to AngularJS directives (otherwise known as EACM):

  * **restrict: ‘E’**&nbsp;- a&nbsp;DOM element with a certain (custom) name, e.g.&nbsp;``
  * **restrict: ‘A’**&nbsp;-&nbsp;a DOM element&nbsp;containing a custom attribute, e.g.&nbsp;``
  * **restrict: ‘C’**&nbsp;- invocation via a class, e.g.&nbsp;``
  * **restrict: ‘M’**&nbsp;-&nbsp;invocation via a comment:&nbsp;``

Pretty cool huh?

Before you begin, please&nbsp;[download the code][2], so you can run these examples while reading this tutorial.

### A basic directive

Here is the Javascript of a basic directive:



    angular.module('ng').directive('testElem', function () {
        return {
            restrict: 'A',
            template: 'hello...{{obj}}',
            //templateUrl: '/partials/template.html',
            link: function (scope, iterStartElement, attr) {
                $(".mydirectiveclass").css({'background-color' : 'yellow'});
                scope.arr = ["mikhail", "is", "the", "best"];
            }
        };
    });


I know what you are thinking. Whaaaaat? Let me explain:

  * First line declares the directive “testElem”. See how E is capital. This means your element or attribute name will be “test-elem”. That’s right the
  * restrict: see explanation above. By the way, you can combine them too, for instance “EA”.
  * template: an HTML string of that the directive element will be replaced by.
  * templateUrl: optionally you can have the template HTML inside another file, especially it is a long one.
  * link: the linking function. After the template has been loaded, this function is called to establish the AngularJS scope and any last-minute effects such as jQuery animation or other logic. You may call this the heart of the directive, eventhough, in my humble opinion the heart is the template.

And here is the HTML code that would use this directive. Notice that you have to add ng-app in the body so that AngularJS knows to do its thing.



    
    
    
        Directive Test
        
        
        
    
    
        
    
    


### Compile function

If you need to grab the content of your original funky elements such as



    
        Parse me... come ooooon! Just parse meee!
    


… the linking function will not allow you to do so. This is because, once again, linking happens AFTER the template has been applied. Solution: instead of link: function you need to specify a compile: function. Here is the kicker:&nbsp;**when you define a compile function in your directive definition, the link function is ignored. Instead the link function will be assigned to what compile function returns**. In other words, you need to return the linking function from the compile function. Wait… those are the same words… LOL! Here is the code though



    angular.module('ng').directive('funkyElement', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: 'isolate',
            template: 'gonna parse this: {{orig}} ... and get this: {{obj}}',
            //templateUrl: 'template.html',
            compile:function (element, attr, transclusionFunc) {
                return function (scope, iterStartElement, attr) {
                    var origElem = transclusionFunc(scope);
                    var content = origElem.text();
                    scope.orig = content;
                    scope.obj = my_custom_parsing(content);
                };
            }
        };
    });


Assuming&nbsp;my_custom_parsing&nbsp; sticks stars between each character, the result HTML will be as follows:



    gonna parse this: Parse me... come ooooon! Just parse meee! 
    ... and get this: P*a*r*s*e* *m*e*.*.*.* *c*o*m*e* *o*o*o*o*o*n*!* *J*u*s*t* *p*a*r*s*e* *m*e*e*e*!* *


Now what the hell is&nbsp;**transclude: true**? And what is&nbsp;**scope: ‘isolate’**?

### Transclusion

… is a funky word for “get my content into the template… HERE”. Actually its even simpler… It means define&nbsp;transclusionFunc.&nbsp;Like so



    angular.module('ng').directive('testElemTransclude', function () {
        return {
            restrict: 'EA',
            transclude: true,
            scope: 'isolate',
            template: 'heading 3preface... blah blah',
        };
    });


And then the content of the directive’s element will be shoved into the div that has ng-transclude. Its just a move function. In my humble opinion it is pretty useless. I write way cooler apps ![:P][3]

### scope: true

Guess what? All the directives within the same app share the same scope. This means if one of them changes scope.obj the “obj” property will change in ALL the widgets. We will always see changes of the latter widget that applies them. To prevent this rather odd behavior we add scope: true to our directive definition and thus avoid scope clashes. Now each directive is separate from the other. I think AngularJS did this to allow directives to collaborate. But in most of my cases I follow the each man for himself philosophy. Just like good old America.

### scope: {…} or&nbsp;3 types of scope parameters: @, &amp;, =

You don’t have to do scope: true, you can also do scope: {}; just as long as scope is defined (i.e. if (scope) is true). Thus, scope: true is just a shorthand to force the directive’s scope to be isolate. EACH MAN FOR HIMSELF! The scope parameter is actually what enables the directive to communicate with the outside world. Here is what I mean:



    
        
            somevar: 
            
            somevar2: 
            
        
     
     
    


And the corresponding JS:



    angular.module('ng').directive('myControl', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                paramStr: '@', // pass as a string
                paramCallback: '&amp;', // pass as a function and call with brackets ()
                paramVar: '=' // double binding!
            },
            template: '{{paramStr}}'
                %2B 'clickame'
                %2B ''
            //link function ($scope, iterStartElement, attr) {}
        };
    });

    function MyController($scope) {
        $scope.somevar = "somevar...rrrr";
        $scope.somevar2 = "somevar...2!";
        $scope.titleControl2 = "Control 2 you beeches!";
        $scope.callback = function () {
            alert('callback called');
        }
        $scope.callback2 = function () {
            alert('callback2 called');
        }
    }


Will produce the following HTML:



    
        
            somevar: somevar...rrrrdsdsa
            
            somevar2: somevar...2!
            
        
        
            control 1
            clickame
            
            
        
        
            Control 2 you beeches!
            clickame
            
            
         
    


So what we have in “scope” is a bunch of fields that you want to expose to the HTML. There are 3 types:

  * name: ‘@’ – this means in your directive you can use scope.name and access the value as a string.
  * name: ‘&amp;’ – this is a callback, which means the parent scope will pass in the function as parameter in HTML
  * name: ‘=’ – double binding! The parent scope will pass in a member to it. Any changes the directive does to this object, including assignment are reflected in the parent scope. Any changes done by the parent scope are reflected in the directive. Read about it’s perils [here][4].

Thus, each  element here has his own scope. And whenever changes are made to paramVar (directive scope) they propagate to somevar and somevar2 respectively in the MyController scope that houses these directives. The converse to also true. Any changes done to somevar, for instance will reflect in ’s paramVar. And of course they do! After all “=” means, they share the same object. But [be careful with nulls][4]!

### Replace: true – getting rid of 

Let’s agree  is not a usual HTML element. We can get rid of it and just have the contents of the template replace it by specifying&nbsp;**replace: true** in the directive. Like so:



    angular.module('ng').directive('replaceTest', function () {
        return {
            restrict: 'E',
            replace: true,
            template: ''
                %2B 'AAAAA'
                %2B 'BBBBB'
                %2B ''
        };
    });


But beware! If your template has the more than one root element you will see the following error:&nbsp;**Error: Template must have exactly one root element.** The following directive will produce this error:



    angular.module('ng').directive('replaceTest', function () {
        return {
            restrict: 'E',
            replace: true,
            template: 'AAAAA' // one root element is OK
                %2B 'BBBBB' // 2nd root element... this is too much!
        };
    });


### Precaution: IE8 compatibility

If you have constrained your directive to attribute or a class you should be fine. However if you want to create custom elements in your HTML, such as  or if you plan on using AngularJS’s custom elements such as , then you need to call document.createElement for each funky element out there.



    


For IE7 I have only figured out this much: it is not compatible! Hence I always precede my directives with



    


### Bonus: $http in my compile or linking function

If you want to access the&nbsp;[$http][5]&nbsp;module from within the directive you can achieve this quite easily by adding $http parameter to the directive defining function itself:



    angular.module('ng').directive('directiveWithHttp', function ($http) {
        return {
            restrict: 'A',
            ...
        };
    });


### Bonus: ng-repeat without an element

Consider that you want to have an ng-repeat to split out multiple elements for each iterations. For example



    Title 1
    ...
    Title 2
    ...
    Title 3
    ...
    ETC!!!


[KnockoutJS][6]&nbsp;allows you to have an iterator in comments. AngularJS does not. Solution? create your own element  with the ng-repeat. Like so: &nbsp;…. Don’t forget to add IE8 compatibility code discussed above. Also note that with does not work for tables when you want to spit out groups of . For tables use tbody, like so



    
    
        ..
        ..
    
    


Tables can handle multiple tbodies… Just not some other weird elements… Cry babies…

### Links

   [1]: http://angularjs.org/ (http://angularjs.org/)
   [2]: http://www.codinginsight.com/wp-content/uploads/2013/02/angular_directives.zip (http://www.codinginsight.com/wp-content/uploads/2013/02/angular_directives.zip)
   [3]: http://www.codinginsight.com/wp-includes/images/smilies/icon_razz.gif
   [4]: http://www.codinginsight.com/digging-angularjs-bugs/ (http://www.codinginsight.com/digging-angularjs-bugs/)
   [5]: http://docs.angularjs.org/api/ng.$http (http://docs.angularjs.org/api/ng.$http)
   [6]: http://knockoutjs.com/ (http://knockoutjs.com/)
