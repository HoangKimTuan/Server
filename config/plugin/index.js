// The MIT License (MIT)
// 
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
"use strict";
var Button = require("ui/button");
var ListView = require("ui/list-view");
var GridLayout = require("ui/layouts/grid-layout");
var ObservableArray = require("data/observable-array");
var TextField = require("ui/text-field");
// import TextView = require("ui/text-view");
var TypeUtils = require("utils/types");
var UIEnums = require("ui/enums");
/**
 * A view for displaying chat messages.
 */
var ChatView = (function (_super) {
    __extends(ChatView, _super);
    /** @inheritdoc */
    function ChatView(json) {
        _super.call(this, json);
        this._messages = new ObservableArray.ObservableArray();
        this._sendChatMessageButtonTapEventListeners = [];
        var me = this;
        me.className = "nsChatView-view";
        this.addRow(new GridLayout.ItemSpec(1, "star"));
        this.addRow(new GridLayout.ItemSpec(1, "auto"));
        var rootRows = this.getRows();
        var chatListRow = rootRows[0];
        var sendMessageRow = rootRows[1];
        // chat list
        this._messageList = new ListView.ListView();
        this._messageList.className = "nsChatView-messageList";
        this._messageList.horizontalAlignment = "stretch";
        this._messageList.verticalAlignment = "stretch";
        this._messageList.items = this._messages;
        this._messageList.itemTemplate = "<GridLayout rows=\"auto\" columns=\"auto,*,auto\" className=\"{{ 'nsChatView-item-' + (isRight ? 'right' : 'left') }}\">\n  <Image row=\"0\" col=\"{{ isRight ? '2' : '0' }}\"\n         className=\"nsChatView-avatar\"\n         verticalAlignment=\"top\"\n         src=\"{{ image }}\"\n         visibility=\"{{ image ? 'visible' : 'collapsed' }}\" />\n  \n  <StackLayout row=\"0\" col=\"1\"\n               className=\"nsChatView-message\">\n               \n    <Border className=\"nsChatView-messageArea\">\n      <StackLayout className=\"nsChatView-content\"\n                   verticalAlignment=\"top\" horizontalAlignment=\"{{ isRight ? 'right' : 'left' }}\">\n        \n        <Label className=\"nsChatView-date\"\n               horizontalAlignment=\"{{ isRight ? 'right' : 'left' }}\"\n               text=\"{{ date }}\"\n               visibility=\"{{ date ? 'visible' : 'collapsed' }}\" />\n        \n        <Label className=\"nsChatView-messageText\"\n               horizontalAlignment=\"{{ isRight ? 'right' : 'left' }}\"\n               text=\"{{ message }}\" textWrap=\"true\" />\n      </StackLayout>\n    </Border>\n  </StackLayout>\n\n  <Border row=\"0\" col=\"{{ isRight ? '0' : '2' }}\"\n          className=\"nsChatView-separator\" />\n</GridLayout>";
        this.addChild(this._messageList);
        GridLayout.GridLayout.setRow(this._messageList, 0);
        this._sendMessageArea = new GridLayout.GridLayout();
        this._sendMessageArea.className = "nsChatView-sendMessageArea";
        this._sendMessageArea.addRow(new GridLayout.ItemSpec(1, "auto"));
        this._sendMessageArea.addColumn(new GridLayout.ItemSpec(1, "star"));
        this._sendMessageArea.addColumn(new GridLayout.ItemSpec(1, "auto"));
        this.addChild(this._sendMessageArea);
        GridLayout.GridLayout.setRow(this._sendMessageArea, 1);
        this._messageField = new TextField.TextField();
        // this._messageField = new TextView.TextView();
        this._messageField.className = "nsChatView-messageField";
        // this._messageField.returnKeyType = UIEnums.ReturnKeyType.send;
        this._messageField.autocorrect = false;
        this._messageField.autocapitalizationType = UIEnums.AutocapitalizationType.none;
        this._sendMessageArea.addChild(this._messageField);
        GridLayout.GridLayout.setRow(this._messageField, 0);
        GridLayout.GridLayout.setColumn(this._messageField, 0);
        this._messageField.on(TextField.TextField.returnPressEvent, function (eventData) {
            me._sendMessageButton
                .notify({
                eventName: Button.Button.tapEvent,
                object: me._sendMessageButton
            });
        });
        this._sendMessageButton = new Button.Button();
        this._sendMessageButton.className = "nsChatView-sendMessageButton";
        this._sendMessageArea.addChild(this._sendMessageButton);
        GridLayout.GridLayout.setRow(this._sendMessageButton, 0);
        GridLayout.GridLayout.setColumn(this._sendMessageButton, 1);
        this._sendMessageButton.on(Button.Button.tapEvent, function (eventData) {
            var chatMsg = me._messageField.text;
            if (TypeUtils.isNullOrUndefined(chatMsg) ||
                "" === chatMsg.trim()) {
                return;
            }
            me.notify(new SendMessageTappedEventData(me, chatMsg));
        });
        this.on(ChatView.sendChatMessageButtonTapEvent, function (eventData) {
            for (var i = 0; i < me._sendChatMessageButtonTapEventListeners.length; i++) {
                var el = me._sendChatMessageButtonTapEventListeners[i];
                el(eventData);
            }
        });
        this.typeMessageHint = "Type message...";
        this.sendMessageButtonCaption = "SEND";
    }
    /**
     * Appends a list of messages.
     *
     * @param {IChatMessage} ...msgs One or more messages to append.
     */
    ChatView.prototype.appendMessages = function () {
        var msgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msgs[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < msgs.length; i++) {
            this._messages.push(msgs[i]);
        }
    };
    /**
     * Focus the text field with the chat message to send.
     *
     * @return {Boolean} Operation was successful or not.
     */
    ChatView.prototype.focusMessageField = function () {
        return this._messageField.focus();
    };
    /**
     * Inserts chat messages at a specific position.
     *
     * @param {Number} index The zero based index where the messages should be inserted.
     * @param {IChatMessage} ...msgs One or more messages to insert.
     */
    ChatView.prototype.insertMessages = function (index) {
        var msgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            msgs[_i - 1] = arguments[_i];
        }
        for (var i = 0; i < msgs.length; i++) {
            this._messages.splice(index + i, 0, msgs[0]);
        }
    };
    Object.defineProperty(ChatView.prototype, "messageField", {
        /**
         * Gets the input field that stores the chat message that should be send.
         */
        get: function () {
            // public get messageField(): TextView.TextView {
            return this._messageField;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatView.prototype, "messageList", {
        /**
         * Gets the list that displays the chat messages.
         */
        get: function () {
            return this._messageList;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatView.prototype, "messages", {
        /**
         * Gets the array of messages.
         */
        get: function () {
            return this._messages;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds an event handler that is invoked when the "SEND" button is clicked.
     *
     * @param {Function} handler The handler to add.
     */
    ChatView.prototype.notifyOnSendMessageTap = function (handler) {
        this._sendChatMessageButtonTapEventListeners
            .push(handler);
    };
    /**
     * Prepends a list of messages.
     *
     * @param {IChatMessage} ...msgs One or more messages to prepend.
     */
    ChatView.prototype.prependMessages = function () {
        var msgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msgs[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < msgs.length; i++) {
            this._messages.splice(i, 0, msgs[0]);
        }
    };
    /**
     * Resets the value of the chat message field.
     */
    ChatView.prototype.resetMessage = function () {
        this._messageField.text = "";
    };
    Object.defineProperty(ChatView.prototype, "sendMessageArea", {
        /**
         * Gets the control that contains the chat message field
         * and the "SEND" button.
         */
        get: function () {
            return this._sendMessageArea;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatView.prototype, "sendMessageButton", {
        /**
         * Gets the button that is used to send a chat message.
         */
        get: function () {
            return this._sendMessageButton;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatView.prototype, "sendMessageButtonCaption", {
        /**
         * Gets and sets the caption of the "SEND" button.
         */
        get: function () {
            return this._sendMessageButton.text;
        },
        set: function (value) {
            this._sendMessageButton.text = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatView.prototype, "typeMessageHint", {
        /**
         * Gets and sets the hint text for the chat message field.
         */
        get: function () {
            return this._messageField.hint;
        },
        set: function (value) {
            this._messageField.hint = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The name of the event that is raised when the "SEND" button is clicked.
     */
    ChatView.sendChatMessageButtonTapEvent = "sendChatMessageButtonTap";
    return ChatView;
}(GridLayout.GridLayout));
exports.ChatView = ChatView;
/**
 * Data for an event that is raised when the "SEND" button is clicked.
 */
var SendMessageTappedEventData = (function () {
    /**
     * Initializes a new instance of that class.
     *
     * @param {ChatView} view The underlying view.
     * @param {String} msg
     */
    function SendMessageTappedEventData(view, msg) {
        this._object = view;
        this._message = msg;
    }
    Object.defineProperty(SendMessageTappedEventData.prototype, "eventName", {
        /** @inheritdoc */
        get: function () {
            return ChatView.sendChatMessageButtonTapEvent;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Focuses the chat message field.
     *
     * @return {Boolean} Operation was successful or not.
     */
    SendMessageTappedEventData.prototype.focusTextField = function () {
        return this._object.focusMessageField();
    };
    Object.defineProperty(SendMessageTappedEventData.prototype, "message", {
        /**
         * Gets the message to send.
         */
        get: function () {
            return this._message;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SendMessageTappedEventData.prototype, "object", {
        /** @inheritdoc */
        get: function () {
            return this._object;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Resets the message value.
     */
    SendMessageTappedEventData.prototype.resetMessage = function () {
        this._object.resetMessage();
    };
    /**
     * Scrolls to bottom.
     */
    SendMessageTappedEventData.prototype.scrollToBottom = function () {
        this._object.messageList
            .scrollToIndex(this._object.messages.length - 1);
        this._object.messageList.refresh();
    };
    return SendMessageTappedEventData;
}());
exports.SendMessageTappedEventData = SendMessageTappedEventData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx3QkFBd0I7QUFDeEIsR0FBRztBQUNILGtFQUFrRTtBQUNsRSxHQUFHO0FBQ0gsK0VBQStFO0FBQy9FLDJFQUEyRTtBQUMzRSw2RUFBNkU7QUFDN0UsOEVBQThFO0FBQzlFLDZFQUE2RTtBQUM3RSwyREFBMkQ7QUFDM0QsR0FBRztBQUNILDZFQUE2RTtBQUM3RSxzREFBc0Q7QUFDdEQsR0FBRztBQUNILDZFQUE2RTtBQUM3RSwyRUFBMkU7QUFDM0UsOEVBQThFO0FBQzlFLHlFQUF5RTtBQUN6RSwwRUFBMEU7QUFDMUUsc0VBQXNFO0FBQ3RFLDRCQUE0Qjs7QUFFNUIsSUFBTyxNQUFNLFdBQVcsV0FBVyxDQUFDLENBQUM7QUFDckMsSUFBTyxRQUFRLFdBQVcsY0FBYyxDQUFDLENBQUM7QUFDMUMsSUFBTyxVQUFVLFdBQVcsd0JBQXdCLENBQUMsQ0FBQztBQUV0RCxJQUFPLGVBQWUsV0FBVyx1QkFBdUIsQ0FBQyxDQUFDO0FBQzFELElBQU8sU0FBUyxXQUFXLGVBQWUsQ0FBQyxDQUFDO0FBQzVDLDZDQUE2QztBQUM3QyxJQUFPLFNBQVMsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUMxQyxJQUFPLE9BQU8sV0FBVyxVQUFVLENBQUMsQ0FBQztBQUVyQzs7R0FFRztBQUNIO0lBQThCLDRCQUFxQjtJQWMvQyxrQkFBa0I7SUFDbEIsa0JBQVksSUFBVTtRQUNsQixrQkFBTSxJQUFJLENBQUMsQ0FBQztRQVBSLGNBQVMsR0FBa0QsSUFBSSxlQUFlLENBQUMsZUFBZSxFQUFnQixDQUFDO1FBRy9HLDRDQUF1QyxHQUFHLEVBQUUsQ0FBQztRQU1qRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsU0FBUyxHQUFHLGlCQUFpQixDQUFDO1FBRWpDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxD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QUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDOzs7T0FBQTtJQUdELHNCQUFXLDhDQUFNO1FBRGpCLGtCQUFrQjthQUNsQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3hCLENBQUM7OztPQUFBO0lBRUQ7O09BRUc7SUFDSSxpREFBWSxHQUFuQjtRQUNJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksbURBQWMsR0FBckI7UUFDSSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVc7YUFDWCxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTdELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFDTCxpQ0FBQztBQUFELENBQUMsQUF6REQsSUF5REM7QUF6RFksa0NBQTBCLDZCQXlEdEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4vLyBcclxuLy8gQ29weXJpZ2h0IChjKSBNYXJjZWwgSm9hY2hpbSBLbG91YmVydCA8bWFyY2VsLmtsb3ViZXJ0QGdteC5uZXQ+XHJcbi8vIFxyXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvXHJcbi8vIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlXHJcbi8vIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vclxyXG4vLyBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4vLyBcclxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cclxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbi8vIFxyXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xyXG4vLyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSXHJcbi8vIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuXHJcbmltcG9ydCBCdXR0b24gPSByZXF1aXJlKFwidWkvYnV0dG9uXCIpO1xyXG5pbXBvcnQgTGlzdFZpZXcgPSByZXF1aXJlKFwidWkvbGlzdC12aWV3XCIpO1xyXG5pbXBvcnQgR3JpZExheW91dCA9IHJlcXVpcmUoXCJ1aS9sYXlvdXRzL2dyaWQtbGF5b3V0XCIpO1xyXG5pbXBvcnQgT2JzZXJ2YWJsZSA9IHJlcXVpcmUoXCJkYXRhL29ic2VydmFibGVcIik7XHJcbmltcG9ydCBPYnNlcnZhYmxlQXJyYXkgPSByZXF1aXJlKFwiZGF0YS9vYnNlcnZhYmxlLWFycmF5XCIpO1xyXG5pbXBvcnQgVGV4dEZpZWxkID0gcmVxdWlyZShcInVpL3RleHQtZmllbGRcIik7XHJcbi8vIGltcG9ydCBUZXh0VmlldyA9IHJlcXVpcmUoXCJ1aS90ZXh0LXZpZXdcIik7XHJcbmltcG9ydCBUeXBlVXRpbHMgPSByZXF1aXJlKFwidXRpbHMvdHlwZXNcIik7XHJcbmltcG9ydCBVSUVudW1zID0gcmVxdWlyZShcInVpL2VudW1zXCIpO1xyXG5cclxuLyoqXHJcbiAqIEEgdmlldyBmb3IgZGlzcGxheWluZyBjaGF0IG1lc3NhZ2VzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENoYXRWaWV3IGV4dGVuZHMgR3JpZExheW91dC5HcmlkTGF5b3V0IHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRoYXQgaXMgcmFpc2VkIHdoZW4gdGhlIFwiU0VORFwiIGJ1dHRvbiBpcyBjbGlja2VkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHNlbmRDaGF0TWVzc2FnZUJ1dHRvblRhcEV2ZW50OiBzdHJpbmcgPSBcInNlbmRDaGF0TWVzc2FnZUJ1dHRvblRhcFwiO1xyXG4gICAgXHJcbiAgICBwcml2YXRlIF9tZXNzYWdlRmllbGQ6IFRleHRGaWVsZC5UZXh0RmllbGQ7XHJcbiAgICAvLyBwcml2YXRlIF9tZXNzYWdlRmllbGQ6IFRleHRWaWV3LlRleHRWaWV3O1xyXG4gICAgcHJpdmF0ZSBfbWVzc2FnZUxpc3Q6IExpc3RWaWV3Lkxpc3RWaWV3O1xyXG4gICAgcHJpdmF0ZSBfbWVzc2FnZXM6IE9ic2VydmFibGVBcnJheS5PYnNlcnZhYmxlQXJyYXk8SUNoYXRNZXNzYWdlPiA9IG5ldyBPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5PElDaGF0TWVzc2FnZT4oKTtcclxuICAgIHByaXZhdGUgX3NlbmRNZXNzYWdlQXJlYTogR3JpZExheW91dC5HcmlkTGF5b3V0O1xyXG4gICAgcHJpdmF0ZSBfc2VuZE1lc3NhZ2VCdXR0b246IEJ1dHRvbi5CdXR0b247XHJcbiAgICBwcml2YXRlIF9zZW5kQ2hhdE1lc3NhZ2VCdXR0b25UYXBFdmVudExpc3RlbmVycyA9IFtdO1xyXG4gICAgXHJcbiAgICAvKiogQGluaGVyaXRkb2MgKi9cclxuICAgIGNvbnN0cnVjdG9yKGpzb24/OiBhbnkpIHtcclxuICAgICAgICBzdXBlcihqc29uKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgIG1lLmNsYXNzTmFtZSA9IFwibnNDaGF0Vmlldy12aWV3XCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRSb3cobmV3IEdyaWRMYXlvdXQuSXRlbVNwZWMoMSwgXCJzdGFyXCIpKTtcclxuICAgICAgICB0aGlzLmFkZFJvdyhuZXcgR3JpZExheW91dC5JdGVtU3BlYygxLCBcImF1dG9cIikpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciByb290Um93cyA9IHRoaXMuZ2V0Um93cygpO1xyXG4gICAgICAgIHZhciBjaGF0TGlzdFJvdyA9IHJvb3RSb3dzWzBdO1xyXG4gICAgICAgIHZhciBzZW5kTWVzc2FnZVJvdyA9IHJvb3RSb3dzWzFdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGNoYXQgbGlzdFxyXG4gICAgICAgIHRoaXMuX21lc3NhZ2VMaXN0ID0gbmV3IExpc3RWaWV3Lkxpc3RWaWV3KCk7XHJcbiAgICAgICAgdGhpcy5fbWVzc2FnZUxpc3QuY2xhc3NOYW1lID0gXCJuc0NoYXRWaWV3LW1lc3NhZ2VMaXN0XCI7XHJcbiAgICAgICAgdGhpcy5fbWVzc2FnZUxpc3QuaG9yaXpvbnRhbEFsaWdubWVudCA9IFwic3RyZXRjaFwiO1xyXG4gICAgICAgIHRoaXMuX21lc3NhZ2VMaXN0LnZlcnRpY2FsQWxpZ25tZW50ID0gXCJzdHJldGNoXCI7XHJcbiAgICAgICAgdGhpcy5fbWVzc2FnZUxpc3QuaXRlbXMgPSB0aGlzLl9tZXNzYWdlcztcclxuICAgICAgICB0aGlzLl9tZXNzYWdlTGlzdC5pdGVtVGVtcGxhdGUgPSBgPEdyaWRMYXlvdXQgcm93cz1cImF1dG9cIiBjb2x1bW5zPVwiYXV0bywqLGF1dG9cIiBjbGFzc05hbWU9XCJ7eyAnbnNDaGF0Vmlldy1pdGVtLScgKyAoaXNSaWdodCA/ICdyaWdodCcgOiAnbGVmdCcpIH19XCI+XHJcbiAgPEltYWdlIHJvdz1cIjBcIiBjb2w9XCJ7eyBpc1JpZ2h0ID8gJzInIDogJzAnIH19XCJcclxuICAgICAgICAgY2xhc3NOYW1lPVwibnNDaGF0Vmlldy1hdmF0YXJcIlxyXG4gICAgICAgICB2ZXJ0aWNhbEFsaWdubWVudD1cInRvcFwiXHJcbiAgICAgICAgIHNyYz1cInt7IGltYWdlIH19XCJcclxuICAgICAgICAgdmlzaWJpbGl0eT1cInt7IGltYWdlID8gJ3Zpc2libGUnIDogJ2NvbGxhcHNlZCcgfX1cIiAvPlxyXG4gIFxyXG4gIDxTdGFja0xheW91dCByb3c9XCIwXCIgY29sPVwiMVwiXHJcbiAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm5zQ2hhdFZpZXctbWVzc2FnZVwiPlxyXG4gICAgICAgICAgICAgICBcclxuICAgIDxCb3JkZXIgY2xhc3NOYW1lPVwibnNDaGF0Vmlldy1tZXNzYWdlQXJlYVwiPlxyXG4gICAgICA8U3RhY2tMYXlvdXQgY2xhc3NOYW1lPVwibnNDaGF0Vmlldy1jb250ZW50XCJcclxuICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsQWxpZ25tZW50PVwidG9wXCIgaG9yaXpvbnRhbEFsaWdubWVudD1cInt7IGlzUmlnaHQgPyAncmlnaHQnIDogJ2xlZnQnIH19XCI+XHJcbiAgICAgICAgXHJcbiAgICAgICAgPExhYmVsIGNsYXNzTmFtZT1cIm5zQ2hhdFZpZXctZGF0ZVwiXHJcbiAgICAgICAgICAgICAgIGhvcml6b250YWxBbGlnbm1lbnQ9XCJ7eyBpc1JpZ2h0ID8gJ3JpZ2h0JyA6ICdsZWZ0JyB9fVwiXHJcbiAgICAgICAgICAgICAgIHRleHQ9XCJ7eyBkYXRlIH19XCJcclxuICAgICAgICAgICAgICAgdmlzaWJpbGl0eT1cInt7IGRhdGUgPyAndmlzaWJsZScgOiAnY29sbGFwc2VkJyB9fVwiIC8+XHJcbiAgICAgICAgXHJcbiAgICAgICAgPExhYmVsIGNsYXNzTmFtZT1cIm5zQ2hhdFZpZXctbWVzc2FnZVRleHRcIlxyXG4gICAgICAgICAgICAgICBob3Jpem9udGFsQWxpZ25tZW50PVwie3sgaXNSaWdodCA/ICdyaWdodCcgOiAnbGVmdCcgfX1cIlxyXG4gICAgICAgICAgICAgICB0ZXh0PVwie3sgbWVzc2FnZSB9fVwiIHRleHRXcmFwPVwidHJ1ZVwiIC8+XHJcbiAgICAgIDwvU3RhY2tMYXlvdXQ+XHJcbiAgICA8L0JvcmRlcj5cclxuICA8L1N0YWNrTGF5b3V0PlxyXG5cclxuICA8Qm9yZGVyIHJvdz1cIjBcIiBjb2w9XCJ7eyBpc1JpZ2h0ID8gJzAnIDogJzInIH19XCJcclxuICAgICAgICAgIGNsYXNzTmFtZT1cIm5zQ2hhdFZpZXctc2VwYXJhdG9yXCIgLz5cclxuPC9HcmlkTGF5b3V0PmA7ICAgICAgXHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLl9tZXNzYWdlTGlzdCk7XHJcbiAgICAgICAgR3JpZExheW91dC5HcmlkTGF5b3V0LnNldFJvdyh0aGlzLl9tZXNzYWdlTGlzdCwgMCk7ICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9zZW5kTWVzc2FnZUFyZWEgPSBuZXcgR3JpZExheW91dC5HcmlkTGF5b3V0KCk7XHJcbiAgICAgICAgdGhpcy5fc2VuZE1lc3NhZ2VBcmVhLmNsYXNzTmFtZSA9IFwibnNDaGF0Vmlldy1zZW5kTWVzc2FnZUFyZWFcIjtcclxuICAgICAgICB0aGlzLl9zZW5kTWVzc2FnZUFyZWEuYWRkUm93KG5ldyBHcmlkTGF5b3V0Lkl0ZW1TcGVjKDEsIFwiYXV0b1wiKSk7XHJcbiAgICAgICAgdGhpcy5fc2VuZE1lc3NhZ2VBcmVhLmFkZENvbHVtbihuZXcgR3JpZExheW91dC5JdGVtU3BlYygxLCBcInN0YXJcIikpO1xyXG4gICAgICAgIHRoaXMuX3NlbmRNZXNzYWdlQXJlYS5hZGRDb2x1bW4obmV3IEdyaWRMYXlvdXQuSXRlbVNwZWMoMSwgXCJhdXRvXCIpKTtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMuX3NlbmRNZXNzYWdlQXJlYSk7XHJcbiAgICAgICAgR3JpZExheW91dC5HcmlkTGF5b3V0LnNldFJvdyh0aGlzLl9zZW5kTWVzc2FnZUFyZWEsIDEpOyBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9tZXNzYWdlRmllbGQgPSBuZXcgVGV4dEZpZWxkLlRleHRGaWVsZCgpO1xyXG4gICAgICAgIC8vIHRoaXMuX21lc3NhZ2VGaWVsZCA9IG5ldyBUZXh0Vmlldy5UZXh0VmlldygpO1xyXG4gICAgICAgIHRoaXMuX21lc3NhZ2VGaWVsZC5jbGFzc05hbWUgPSBcIm5zQ2hhdFZpZXctbWVzc2FnZUZpZWxkXCI7XHJcbiAgICAgICAgLy8gdGhpcy5fbWVzc2FnZUZpZWxkLnJldHVybktleVR5cGUgPSBVSUVudW1zLlJldHVybktleVR5cGUuc2VuZDtcclxuICAgICAgICB0aGlzLl9tZXNzYWdlRmllbGQuYXV0b2NvcnJlY3QgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9tZXNzYWdlRmllbGQuYXV0b2NhcGl0YWxpemF0aW9uVHlwZSA9IFVJRW51bXMuQXV0b2NhcGl0YWxpemF0aW9uVHlwZS5ub25lO1xyXG4gICAgICAgIHRoaXMuX3NlbmRNZXNzYWdlQXJlYS5hZGRDaGlsZCh0aGlzLl9tZXNzYWdlRmllbGQpO1xyXG4gICAgICAgIEdyaWRMYXlvdXQuR3JpZExheW91dC5zZXRSb3codGhpcy5fbWVzc2FnZUZpZWxkLCAwKTtcclxuICAgICAgICBHcmlkTGF5b3V0LkdyaWRMYXlvdXQuc2V0Q29sdW1uKHRoaXMuX21lc3NhZ2VGaWVsZCwgMCk7XHJcblxyXG4gICAgICAgIHRoaXMuX21lc3NhZ2VGaWVsZC5vbihUZXh0RmllbGQuVGV4dEZpZWxkLnJldHVyblByZXNzRXZlbnQsIChldmVudERhdGEpID0+IHtcclxuICAgICAgICAgICAgbWUuX3NlbmRNZXNzYWdlQnV0dG9uXHJcbiAgICAgICAgICAgICAgLm5vdGlmeSh7XHJcbiAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogQnV0dG9uLkJ1dHRvbi50YXBFdmVudCxcclxuICAgICAgICAgICAgICAgICAgb2JqZWN0OiBtZS5fc2VuZE1lc3NhZ2VCdXR0b25cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fc2VuZE1lc3NhZ2VCdXR0b24gPSBuZXcgQnV0dG9uLkJ1dHRvbigpO1xyXG4gICAgICAgIHRoaXMuX3NlbmRNZXNzYWdlQnV0dG9uLmNsYXNzTmFtZSA9IFwibnNDaGF0Vmlldy1zZW5kTWVzc2FnZUJ1dHRvblwiO1xyXG4gICAgICAgIHRoaXMuX3NlbmRNZXNzYWdlQXJlYS5hZGRDaGlsZCh0aGlzLl9zZW5kTWVzc2FnZUJ1dHRvbik7XHJcbiAgICAgICAgR3JpZExheW91dC5HcmlkTGF5b3V0LnNldFJvdyh0aGlzLl9zZW5kTWVzc2FnZUJ1dHRvbiwgMCk7XHJcbiAgICAgICAgR3JpZExheW91dC5HcmlkTGF5b3V0LnNldENvbHVtbih0aGlzLl9zZW5kTWVzc2FnZUJ1dHRvbiwgMSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fc2VuZE1lc3NhZ2VCdXR0b24ub24oQnV0dG9uLkJ1dHRvbi50YXBFdmVudCwgKGV2ZW50RGF0YSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgY2hhdE1zZyA9IG1lLl9tZXNzYWdlRmllbGQudGV4dDtcclxuICAgICAgICAgICAgaWYgKFR5cGVVdGlscy5pc051bGxPclVuZGVmaW5lZChjaGF0TXNnKSB8fFxyXG4gICAgICAgICAgICAgICAgXCJcIiA9PT0gY2hhdE1zZy50cmltKCkpIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBtZS5ub3RpZnkobmV3IFNlbmRNZXNzYWdlVGFwcGVkRXZlbnREYXRhKG1lLCBjaGF0TXNnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vbihDaGF0Vmlldy5zZW5kQ2hhdE1lc3NhZ2VCdXR0b25UYXBFdmVudCwgZnVuY3Rpb24oZXZlbnREYXRhKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWUuX3NlbmRDaGF0TWVzc2FnZUJ1dHRvblRhcEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZWwgPSBtZS5fc2VuZENoYXRNZXNzYWdlQnV0dG9uVGFwRXZlbnRMaXN0ZW5lcnNbaV07XHJcbiAgICAgICAgICAgICAgICBlbChldmVudERhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMudHlwZU1lc3NhZ2VIaW50ID0gXCJUeXBlIG1lc3NhZ2UuLi5cIjtcclxuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlQnV0dG9uQ2FwdGlvbiA9IFwiU0VORFwiO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEFwcGVuZHMgYSBsaXN0IG9mIG1lc3NhZ2VzLlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge0lDaGF0TWVzc2FnZX0gLi4ubXNncyBPbmUgb3IgbW9yZSBtZXNzYWdlcyB0byBhcHBlbmQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhcHBlbmRNZXNzYWdlcyguLi5tc2dzOiBJQ2hhdE1lc3NhZ2VbXSkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXNncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKG1zZ3NbaV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvY3VzIHRoZSB0ZXh0IGZpZWxkIHdpdGggdGhlIGNoYXQgbWVzc2FnZSB0byBzZW5kLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBPcGVyYXRpb24gd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZm9jdXNNZXNzYWdlRmllbGQoKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlRmllbGQuZm9jdXMoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnNlcnRzIGNoYXQgbWVzc2FnZXMgYXQgYSBzcGVjaWZpYyBwb3NpdGlvbi5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IFRoZSB6ZXJvIGJhc2VkIGluZGV4IHdoZXJlIHRoZSBtZXNzYWdlcyBzaG91bGQgYmUgaW5zZXJ0ZWQuXHJcbiAgICAgKiBAcGFyYW0ge0lDaGF0TWVzc2FnZX0gLi4ubXNncyBPbmUgb3IgbW9yZSBtZXNzYWdlcyB0byBpbnNlcnQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpbnNlcnRNZXNzYWdlcyhpbmRleDogbnVtYmVyLCAuLi5tc2dzOiBJQ2hhdE1lc3NhZ2VbXSkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXNncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5zcGxpY2UoaW5kZXggKyBpLCAwLCBtc2dzWzBdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgaW5wdXQgZmllbGQgdGhhdCBzdG9yZXMgdGhlIGNoYXQgbWVzc2FnZSB0aGF0IHNob3VsZCBiZSBzZW5kLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IG1lc3NhZ2VGaWVsZCgpOiBUZXh0RmllbGQuVGV4dEZpZWxkIHtcclxuICAgIC8vIHB1YmxpYyBnZXQgbWVzc2FnZUZpZWxkKCk6IFRleHRWaWV3LlRleHRWaWV3IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWVzc2FnZUZpZWxkO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGxpc3QgdGhhdCBkaXNwbGF5cyB0aGUgY2hhdCBtZXNzYWdlcy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBtZXNzYWdlTGlzdCgpOiBMaXN0Vmlldy5MaXN0VmlldyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VMaXN0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGFycmF5IG9mIG1lc3NhZ2VzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IG1lc3NhZ2VzKCk6IE9ic2VydmFibGVBcnJheS5PYnNlcnZhYmxlQXJyYXk8SUNoYXRNZXNzYWdlPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYW4gZXZlbnQgaGFuZGxlciB0aGF0IGlzIGludm9rZWQgd2hlbiB0aGUgXCJTRU5EXCIgYnV0dG9uIGlzIGNsaWNrZWQuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXIgVGhlIGhhbmRsZXIgdG8gYWRkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbm90aWZ5T25TZW5kTWVzc2FnZVRhcChoYW5kbGVyOiAoZXZlbnREYXRhOiBTZW5kTWVzc2FnZVRhcHBlZEV2ZW50RGF0YSkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMuX3NlbmRDaGF0TWVzc2FnZUJ1dHRvblRhcEV2ZW50TGlzdGVuZXJzXHJcbiAgICAgICAgICAgIC5wdXNoKGhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIFByZXBlbmRzIGEgbGlzdCBvZiBtZXNzYWdlcy5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHtJQ2hhdE1lc3NhZ2V9IC4uLm1zZ3MgT25lIG9yIG1vcmUgbWVzc2FnZXMgdG8gcHJlcGVuZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHByZXBlbmRNZXNzYWdlcyguLi5tc2dzOiBJQ2hhdE1lc3NhZ2VbXSkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXNncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5zcGxpY2UoaSwgMCwgbXNnc1swXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIFJlc2V0cyB0aGUgdmFsdWUgb2YgdGhlIGNoYXQgbWVzc2FnZSBmaWVsZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlc2V0TWVzc2FnZSgpIHtcclxuICAgICAgICB0aGlzLl9tZXNzYWdlRmllbGQudGV4dCA9IFwiXCI7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgY29udHJvbCB0aGF0IGNvbnRhaW5zIHRoZSBjaGF0IG1lc3NhZ2UgZmllbGRcclxuICAgICAqIGFuZCB0aGUgXCJTRU5EXCIgYnV0dG9uLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHNlbmRNZXNzYWdlQXJlYSgpOiBHcmlkTGF5b3V0LkdyaWRMYXlvdXQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kTWVzc2FnZUFyZWE7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgYnV0dG9uIHRoYXQgaXMgdXNlZCB0byBzZW5kIGEgY2hhdCBtZXNzYWdlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHNlbmRNZXNzYWdlQnV0dG9uKCk6IEJ1dHRvbi5CdXR0b24ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kTWVzc2FnZUJ1dHRvbjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIGFuZCBzZXRzIHRoZSBjYXB0aW9uIG9mIHRoZSBcIlNFTkRcIiBidXR0b24uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgc2VuZE1lc3NhZ2VCdXR0b25DYXB0aW9uKCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZW5kTWVzc2FnZUJ1dHRvbi50ZXh0O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBzZW5kTWVzc2FnZUJ1dHRvbkNhcHRpb24odmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX3NlbmRNZXNzYWdlQnV0dG9uLnRleHQgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIGFuZCBzZXRzIHRoZSBoaW50IHRleHQgZm9yIHRoZSBjaGF0IG1lc3NhZ2UgZmllbGQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgdHlwZU1lc3NhZ2VIaW50KCkgOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tZXNzYWdlRmllbGQuaGludDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgdHlwZU1lc3NhZ2VIaW50KHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9tZXNzYWdlRmllbGQuaGludCA9IHZhbHVlO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogRGVzY3JpYmVzIGFuIG9iamVjdCB0aGF0IHN0b3JlcyByZXF1aXJlZCBkYXRhIGZvciBhIGNoYXIgbWVzc2FnZS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUNoYXRNZXNzYWdlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRhdGUuXHJcbiAgICAgKiBcclxuICAgICAqIEBwcm9wZXJ0eVxyXG4gICAgICovXHJcbiAgICBkYXRlPzogYW55O1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBpbWFnZSBzb3VyY2UuXHJcbiAgICAgKiBcclxuICAgICAqIEBwcm9wZXJ0eVxyXG4gICAgICovXHJcbiAgICBpbWFnZT86IGFueTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIGlmIHRoZSBkaXNwbGF5ZWQgaXRlbSBpcyBhbGlnbmVkIG9uIHRoZSByaWdodCBzaWRlIG9yIG5vdC5cclxuICAgICAqIFxyXG4gICAgICogQHByb3BlcnR5XHJcbiAgICAgKi9cclxuICAgIGlzUmlnaHQ/OiBib29sZWFuO1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBtZXNzYWdlIHZhbHVlLlxyXG4gICAgICogXHJcbiAgICAgKiBAcHJvcGVydHlcclxuICAgICAqL1xyXG4gICAgbWVzc2FnZT86IGFueTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERhdGEgZm9yIGFuIGV2ZW50IHRoYXQgaXMgcmFpc2VkIHdoZW4gdGhlIFwiU0VORFwiIGJ1dHRvbiBpcyBjbGlja2VkLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFNlbmRNZXNzYWdlVGFwcGVkRXZlbnREYXRhIGltcGxlbWVudHMgT2JzZXJ2YWJsZS5FdmVudERhdGEge1xyXG4gICAgcHJpdmF0ZSBfbWVzc2FnZTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBfb2JqZWN0OiBDaGF0VmlldzsgICAgXHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgdGhhdCBjbGFzcy5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHtDaGF0Vmlld30gdmlldyBUaGUgdW5kZXJseWluZyB2aWV3LlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1zZ1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcih2aWV3OiBDaGF0VmlldywgbXNnOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9vYmplY3QgPSB2aWV3O1xyXG4gICAgICAgIHRoaXMuX21lc3NhZ2UgPSBtc2c7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKiBAaW5oZXJpdGRvYyAqL1xyXG4gICAgcHVibGljIGdldCBldmVudE5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gQ2hhdFZpZXcuc2VuZENoYXRNZXNzYWdlQnV0dG9uVGFwRXZlbnQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogRm9jdXNlcyB0aGUgY2hhdCBtZXNzYWdlIGZpZWxkLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBPcGVyYXRpb24gd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZm9jdXNUZXh0RmllbGQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29iamVjdC5mb2N1c01lc3NhZ2VGaWVsZCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIG1lc3NhZ2UgdG8gc2VuZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBtZXNzYWdlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKiBAaW5oZXJpdGRvYyAqL1xyXG4gICAgcHVibGljIGdldCBvYmplY3QoKTogQ2hhdFZpZXcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vYmplY3Q7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogUmVzZXRzIHRoZSBtZXNzYWdlIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVzZXRNZXNzYWdlKCkge1xyXG4gICAgICAgIHRoaXMuX29iamVjdC5yZXNldE1lc3NhZ2UoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBTY3JvbGxzIHRvIGJvdHRvbS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNjcm9sbFRvQm90dG9tKCkge1xyXG4gICAgICAgIHRoaXMuX29iamVjdC5tZXNzYWdlTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIC5zY3JvbGxUb0luZGV4KHRoaXMuX29iamVjdC5tZXNzYWdlcy5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICB0aGlzLl9vYmplY3QubWVzc2FnZUxpc3QucmVmcmVzaCgpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==