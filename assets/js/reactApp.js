'use strict';

var InputForm = React.createClass({
    displayName: 'InputForm',

    getInitialState: function getInitialState() {
        return {
            value: '',
            valid: true,
            blocks: []
        };
    },

    defaultState: {
        value: '',
        valid: true
    },

    validateUserInput: function validateUserInput(userInput) {
        var url = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
        if (userInput.length && url.test(userInput)) {
            this.setState({ valid: true });
        } else {
            this.setState({ valid: false });
        }
    },
    handleChange: function handleChange(event) {
        event.preventDefault();
        this.validateUserInput(event.target.value);
        this.setState({ value: event.target.value });
    },
    handleClick: function handleClick(event) {
        this.validateUserInput(this.state.value);
        var blocks = this.state.blocks;
        if (this.state.valid === true && blocks.indexOf(this.state.value) == -1) {
            blocks.unshift(this.state.value);
            this.setState({ blocks: blocks });
            this.setState(this.defaultState);
        } else {
            this.setState({ valid: false });
        }
        console.info(this.state);
    },
    render: function render() {
        var messageEmptyNewsBlocks = false;
        if (!this.state.blocks.length) {
            messageEmptyNewsBlocks = React.createElement(
                'div',
                { className: 'alert alert-success text-center' },
                ' ',
                React.createElement(
                    'strong',
                    null,
                    'Пусто!'
                ),
                ' Добавьте адрес RSS/XML/Atom для отслеживания. '
            );
        }
        var hasError = [];
        return React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
                'div',
                { className: 'col-sm-12' },
                React.createElement(
                    'form',
                    null,
                    React.createElement(
                        'div',
                        { className: classNames('form-group', { 'has-error': !this.state.valid }) },
                        React.createElement(
                            'div',
                            { className: 'input-group' },
                            React.createElement('input', { className: 'form-control',
                                onChange: this.handleChange,
                                value: this.state.value,
                                placeholder: 'Добавьте адрес RSS/XML/Atom для отслеживания' }),
                            React.createElement(
                                'div',
                                { className: 'input-group-addon fa fa-plus',
                                    onClick: this.handleClick },
                                ' '
                            )
                        )
                    )
                ),
                messageEmptyNewsBlocks
            )
        );
    }
});
ReactDOM.render(React.createElement(InputForm, null), $('.InputForm')[0]);