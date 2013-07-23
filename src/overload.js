;(function() {
  // this === window ~ normally
	var ov = this.Overload = function(argsOps, func) {
		argsOps = ov.convertArgsString(argsOps);
		return function() {
			return func.apply(this, ov.getCorrectArguments(arguments, argsOps));
		}
	};

	ov.__proto__ = {
		convertArgsString: function(argsString) {
			argsString = argsString.split(",");

			var reg = new RegExp("\\{([^}]+)\\}\\s*(\\[*\\w*)"); // fixes vim issues with brackets {}
			// reg = /\{([^}]+)\}\s*(\[*\w*)/;
			var args = {
					length: argsString.length,
					requiredLength: 0
				};

			for(var i = 0, n = argsString.length; i < n; i++) {
				var match = argsString[i].match(reg);
				var argument = {
					types:    [],
					mixed:    match[1] === "*",
					required: match[2].charAt(0) !== "["
				};

				args[i] = argument;

				if(argument.required) args.requiredLength++;

				if(argument.mixed) continue;

				var types = match[1].split("|");
				for(var j = 0, m = types.length; j < m; j++) {
					argument.types.push(types[j].toLowerCase());
				}
			}

			return args;
		},
		isValidArgument: function(argument, option) {
			if(option.mixed) return true;

			for(var i = 0, n = option.types.length; i < n; i++) {
				if(typeof argument === option.types[i]) {
					return true;
				}
			}

			return false;
		},
		getCorrectArguments: function(args, ops) {
			var correctArgs = new Array(ops.length);

			if(args.length === ops.length) {
				for(var i = 0, n = args.length; i < n; i++) {
					correctArgs[i] = args[i];
				}

				return correctArgs;
			}

			var argsForRequired = args.length;
			var required = ops.requiredLength;

			for(var i = 0, j = 0, n = ops.length; i < n; i++) {
				var option = ops[i];
				var argument = args[j];
				if(option.required || (argsForRequired - 1 >= required && ov.isValidArgument(argument, option))) {
					correctArgs[i] = argument;
					j++;
					argsForRequired--;
					if(option.required) required--;
				}
			}

			return correctArgs;
		}
	};

}).call(this);
