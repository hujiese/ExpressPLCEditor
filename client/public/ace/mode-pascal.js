ace.define("ace/mode/pascal_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var PascalHighlightRules = function() {

    this.$rules = { start: 
       [ { caseInsensitive: true,
           token: 'keyword.control.pascal',
           regex: '\\b(?:(ABS|ACOS|ACTION|ADD|AND|ANDN|ANY|ANY_BIT|ANY_DATE|ANY_DERIVED|ANY_ELEMENTARY|ANY_INT|ANY_MAGNITUDE|ANY_NUM|ANY_REAL|ARRAY|ASIN|AT|ATAN|BOOL|BY|BYTE|CAL|CALC|CALCN|CASE|CD|CDT|CLK|CONCAT|CONFIGURATION|CONSTANT|COS|CTD|CTU|CTUD|CU|CV|D|DATE|DATE_AND_TIME|DELETE|DINT|DIV|DO|DS|DT|DWORD|ELSE|ELSIF|END_ACTION|END_CASE|END_CONFIGURATION|END_FOR|END_FUNCTION|END_FUNCTION_BLOCK|END_IF|END_PROGRAM|END_REPEAT|END_RESOURCE|END_STEP|END_STRUCT|END_TRANSITION|END_TYPE|END_VAR|END_WHILE|EN|ENO|EQ|ET|EXIT|EXP|EXPT|FALSE|F_EDGE|F_TRIG|FIND|FOR|FROM|FUNCTION|FUNCTION_BLOCK|GE|GT|IF|IN|INITIAL_STEP|INSERT|INT|INTERVAL|JMP|JMPC|JMPCN|L|LD|LDN|LE|LEFT|LEN|LIMIT|LINT|LN|LOG|LREAL|LT|LWORD|MAX|MID|MIN|MOD|MOVE|MUL|MUX|N|NE|NEG|NON_RETAIN|NOT|OF|ON|OR|ORN|P|PRIORITY|PROGRAM|PT|PV|Q|Q1|QU|QD|R|R1|R_EDGE|R_TRIG|READ_ONLY|READ_WRITE|REAL|RELEASE|REPEAT|REPLACE|RESOURCE|RET|RETAIN|RETC|RETCN|RETURN|RIGHT|ROL|ROR|RS|S|S1|SD|SEL|SEMA|SHL|SHR|SIN|SINGLE|SINT|SL|SQRT|SR|ST|STEP|STN|STRING|STRUCT|SUB|T|TAN|TASK|THEN|TIME|TIME_OF_DAY|TO|TOD|TOF|TON|TP|TRANSITION|TRUE|TYPE|UDINT|UINT|ULINT|UNTIL|USINT|VAR|VAR_ACCESS|VAR_CONFIG|VAR_EXTERNAL|VAR_GLOBAL|VAR_INPUT|VAR_IN_OUT|VAR_OUTPUT|VAR_TEMP|WHILE|WITH|WORD|WSTRING|XOR|XORN))\\b' },
         { caseInsensitive: true,           
           token: 
            [ 'variable.pascal', "text",
              'storage.type.prototype.pascal',
              'entity.name.function.prototype.pascal' ],
           regex: '\\b(function|procedure)(\\s+)(\\w+)(\\.\\w+)?(?=(?:\\(.*?\\))?;\\s*(?:attribute|forward|external))' },
         { caseInsensitive: true,
           token: 
            [ 'variable.pascal', "text",
              'storage.type.function.pascal',
              'entity.name.function.pascal' ],
           regex: '\\b(function|procedure)(\\s+)(\\w+)(\\.\\w+)?' },
         { token: 'constant.numeric.pascal',
           regex: '\\b((0(x|X)[0-9a-fA-F]*)|(([0-9]+\\.?[0-9]*)|(\\.[0-9]+))((e|E)(\\+|-)?[0-9]+)?)(L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b' },
         { token: 'punctuation.definition.comment.pascal',
           regex: '--.*$',
           push_: 
            [ { token: 'comment.line.double-dash.pascal.one',
                regex: '$',
                next: 'pop' },
              { defaultToken: 'comment.line.double-dash.pascal.one' } ] },
         { token: 'punctuation.definition.comment.pascal',
           regex: '//.*$',
           push_: 
            [ { token: 'comment.line.double-slash.pascal.two',
                regex: '$',
                next: 'pop' },
              { defaultToken: 'comment.line.double-slash.pascal.two' } ] },
         { token: 'punctuation.definition.comment.pascal',
           regex: '\\(\\*',
           push: 
            [ { token: 'punctuation.definition.comment.pascal',
                regex: '\\*\\)',
                next: 'pop' },
              { defaultToken: 'comment.block.pascal.one' } ] },
         { token: 'punctuation.definition.comment.pascal',
           regex: '\\{',
           push: 
            [ { token: 'punctuation.definition.comment.pascal',
                regex: '\\}',
                next: 'pop' },
              { defaultToken: 'comment.block.pascal.two' } ] },
         { token: 'punctuation.definition.string.begin.pascal',
           regex: '"',
           push: 
            [ { token: 'constant.character.escape.pascal', regex: '\\\\.' },
              { token: 'punctuation.definition.string.end.pascal',
                regex: '"',
                next: 'pop' },
              { defaultToken: 'string.quoted.double.pascal' } ]
            },
         { token: 'punctuation.definition.string.begin.pascal',
           regex: '\'',
           push: 
            [ { token: 'constant.character.escape.apostrophe.pascal',
                regex: '\'\'' },
              { token: 'punctuation.definition.string.end.pascal',
                regex: '\'',
                next: 'pop' },
              { defaultToken: 'string.quoted.single.pascal' } ] },
          { token: 'keyword.operator',
           regex: '[+\\-;,/*%]|:=|=' } ] };
    
    this.normalizeRules();
};

oop.inherits(PascalHighlightRules, TextHighlightRules);

exports.PascalHighlightRules = PascalHighlightRules;
});

ace.define("ace/mode/folding/coffee",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode","ace/range"], function(require, exports, module) {
"use strict";

var oop = require("../../lib/oop");
var BaseFoldMode = require("./fold_mode").FoldMode;
var Range = require("../../range").Range;

var FoldMode = exports.FoldMode = function() {};
oop.inherits(FoldMode, BaseFoldMode);

(function() {

    this.getFoldWidgetRange = function(session, foldStyle, row) {
        var range = this.indentationBlock(session, row);
        if (range)
            return range;

        var re = /\S/;
        var line = session.getLine(row);
        var startLevel = line.search(re);
        if (startLevel == -1 || line[startLevel] != "#")
            return;

        var startColumn = line.length;
        var maxRow = session.getLength();
        var startRow = row;
        var endRow = row;

        while (++row < maxRow) {
            line = session.getLine(row);
            var level = line.search(re);

            if (level == -1)
                continue;

            if (line[level] != "#")
                break;

            endRow = row;
        }

        if (endRow > startRow) {
            var endColumn = session.getLine(endRow).length;
            return new Range(startRow, startColumn, endRow, endColumn);
        }
    };
    this.getFoldWidget = function(session, foldStyle, row) {
        var line = session.getLine(row);
        var indent = line.search(/\S/);
        var next = session.getLine(row + 1);
        var prev = session.getLine(row - 1);
        var prevIndent = prev.search(/\S/);
        var nextIndent = next.search(/\S/);

        if (indent == -1) {
            session.foldWidgets[row - 1] = prevIndent!= -1 && prevIndent < nextIndent ? "start" : "";
            return "";
        }
        if (prevIndent == -1) {
            if (indent == nextIndent && line[indent] == "#" && next[indent] == "#") {
                session.foldWidgets[row - 1] = "";
                session.foldWidgets[row + 1] = "";
                return "start";
            }
        } else if (prevIndent == indent && line[indent] == "#" && prev[indent] == "#") {
            if (session.getLine(row - 2).search(/\S/) == -1) {
                session.foldWidgets[row - 1] = "start";
                session.foldWidgets[row + 1] = "";
                return "";
            }
        }

        if (prevIndent!= -1 && prevIndent < indent)
            session.foldWidgets[row - 1] = "start";
        else
            session.foldWidgets[row - 1] = "";

        if (indent < nextIndent)
            return "start";
        else
            return "";
    };

}).call(FoldMode.prototype);

});

ace.define("ace/mode/pascal",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/pascal_highlight_rules","ace/mode/folding/coffee"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var PascalHighlightRules = require("./pascal_highlight_rules").PascalHighlightRules;
var FoldMode = require("./folding/coffee").FoldMode;

var Mode = function() {
    this.HighlightRules = PascalHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
       
    this.lineCommentStart = ["--", "//"];
    this.blockComment = [
        {start: "(*", end: "*)"},
        {start: "{", end: "}"}
    ];
    
    this.$id = "ace/mode/pascal";
}).call(Mode.prototype);

exports.Mode = Mode;
});
