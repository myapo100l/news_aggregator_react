moment.locale('ru');
function validateUserInput(userInput) {
    self = self || this;
    var url = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
    if(
        userInput.length
        && url.test(userInput)
    ) {
        return true;
    }
    else {
        return false;
    }

}
var NewsBlock = React.createClass({
    getInitialState: function() {
        return {
            url: this.props.url,
            title : this.props.url,
            du : null,
            edited : false,
            form : {
                url: this.props.url,
                updated : 0,
                valid : true
            },
            items : [],
            lastUpdate : '0c.'
        }
    },
    updateItems : function(url) {
        self = this;
        $.getJSON( document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=5&q='+encodeURIComponent(url)+'&callback=?', function(data) {
            try {
                self.setState({
                    title : data.responseData.feed.title,
                    items : data.responseData.feed.entries
                });
            }
            catch (err) {
                self.setState(self.getInitialState());
            }
        }).fail(function(data) {
            self.setState(self.getInitialState());
        }).always(function() {
            self.setState({
                du : Date.now()
            });
        });
    },
    handleEdit : function(event) {
        event.preventDefault();
        this.setState({edited : !this.state.edited});
    },
    handleUpdate : function(event) {
        event.preventDefault();
        this.setState({edited : false});
        this.updateItems(this.props.url);
    },
    handleClose : function(event) {
        event.preventDefault();
        clearInterval(this.intervalId);
        this.intervalId = null;
        var blocks = App.state.blocks;
        blocks.splice(App.findBlockByUrl(this.props.url),1);
        App.setState({blocks : blocks});
    },
    handleRadio : function(event) {
        this.setState({form : $.extend(this.state.form,{updated : parseInt(event.target.value)})});
    },
    handleEditUrl : function(event) {
        event.preventDefault();
        this.setState({form : $.extend(this.state.form,{url : event.target.value},{valid : validateUserInput(event.target.value)})});

    },
    handleConfimEdit : function(event) {
        event.preventDefault();
        this.setState({form : $.extend(this.state.form,{valid : validateUserInput(this.state.form.url)})});
        if(this.state.form.valid === true) {
            var blocks = App.state.blocks;
            var _key = App.findBlockByUrl(this.props.url);
            var __key = App.findBlockByUrl(this.state.form.url);
            var _block = blocks[_key];
            if(_key == __key || !__key) {
                blocks[_key] = {url : this.state.form.url,updated : this.state.form.updated};
            }
            else {
                blocks[_key] = $.extend(_block,{updated : this.state.form.updated})
            }
            console.log(blocks);
            this.setState({edited : false});
            App.setState({blocks : blocks});
        }
    },
    intervalId : null,
    componentDidMount : function(){
        var self = this;
        self.intervalId = setInterval(function() {
            if(self.isMounted()) {
                var _now = Date.now();
                var time = self.state.du;
                var tick = Math.ceil((_now-time)/1000);
                if(self.props.updated != 0 && tick%self.props.updated == 0 ) {
                    self.updateItems(self.props.url);
                }
                if(tick >= 60) {
                    self.setState({'lastUpdate' : moment(time).fromNow()});
                }
                else {
                    self.setState({'lastUpdate' : Math.ceil((_now-time)/1000)+'c.'});
                }
            }
        },1000);
        this.updateItems(this.props.url);
    },
    render : function() {
        var radioRang = [0,10,20,30,40];
        self = this;
        return (
            <div className="col-sm-4">
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <div className="btn-group pull-right">
                            <button type="button" className="btn btn-default" onClick={this.handleUpdate}><i className="fa fa-refresh"></i></button>
                            <button type="button" className="btn btn-default" onClick={this.handleEdit}><i className="fa fa-edit"></i></button>
                            <button type="button" className="btn btn-default" onClick={this.handleClose}><i className="fa fa-close"></i></button>
                        </div>
                        {this.state.title}
                        <small>{this.props.url}</small>
                    </div>
                    <div className="panel-body">
                        <div style={this.state.edited ? {display : 'none'} : {display : 'block'}}>
                        <ul className="list-unstyled">
                            {this.state.items.map(function(item, i) {
                                return <li key={i}>
                                    <a href={item.link} target="_blank">{item.title}</a>
                                    <small>{item.content}</small>
                                </li>;
                            })}
                        </ul>
                            <div className="alert alert-success text-center" style={this.state.items.length ? {display : 'none'} : {}}> <strong>Пусто!</strong> Нет данных....</div>
                        </div>
                        <div style={this.state.edited ? {display : 'block'} : {display : 'none'} }>
                            <form>
                                <div className={classNames('form-group', { 'has-error' : !this.state.form.valid})}>
                                    <label>Ссылка</label>
                                    <input className="form-control" defaultValue={this.state.form.url} onChange={this.handleEditUrl} />
                                </div>
                                <div className="form-group">
                                    <label>Период обносления: </label>
                                    <div>
                                        {radioRang.map(function(updated, i) {
                                            return <label key={i} className="radio-inline">
                                                <input type="radio" name="updated" defaultValue={updated} defaultChecked={self.props.updated==updated} onChange={self.handleRadio} />{updated == 0 ? 'Нет' :  updated}
                                            </label>
                                        })}
                                    </div>
                                </div>
                                <button type="button" className="btn btn-default btn-block" onClick={this.handleConfimEdit}><i fa className="fa fa-edit"></i> Изменить</button>
                            </form>
                        </div>
                    </div>
                    <div className="panel-footer">
                        <p>Последнее обновление: <strong>{this.state.lastUpdate}</strong></p>
                    </div>
                </div>
            </div>
        );
    }
});
var InputForm = React.createClass({
    getInitialState: function() {
        return {
            value: '',
            valid : true,
            blocks : []
        }
    },

    defaultState : {
        value: '',
        valid : true,
    },
    findBlockByUrl : function (url) {
        var res = false;
        this.state.blocks.forEach(function(val, key){
            if(val.url === url) {
                return res = key;
            }
        })
        return res;
    },
    handleChange : function(event) {
        event.preventDefault();
        this.setState({value : event.target.value});
        this.setState({valid : validateUserInput(event.target.value)});
    },
    handleClick : function(event) {
        this.setState({valid : validateUserInput(this.state.value)});
        var blocks = this.state.blocks;
        if(this.state.valid === true && this.findBlockByUrl(this.state.value) === false) {
            blocks.unshift({ url : this.state.value, updated: 0});
            this.setState({blocks : blocks});
            this.setState(this.defaultState);
        }
        else {
            this.setState({valid : false});
        }
    },
    render: function() {
        var self = this;
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        <form>
                            <div className={classNames('form-group', { 'has-error' : !this.state.valid})}>
                                <div className="input-group">
                                    <input className="form-control"
                                           onChange={this.handleChange}
                                           value={this.state.value}
                                           placeholder="Добавьте адрес RSS/XML/Atom для отслеживания" />
                                    <div className="input-group-addon fa fa-plus"
                                         onClick={this.handleClick}>
                                        &nbsp;
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className="alert alert-success text-center" style={this.state.blocks.length ? {display : 'none'} : {}}> <strong>Пусто!</strong> Добавьте адрес RSS/XML/Atom для отслеживания. </div>
                        <div className="row">
                            {this.state.blocks.map(function(item, i) {
                                return <NewsBlock key={item.url} url={item.url} updated={item.updated}/>;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});
var App = ReactDOM.render(
    <InputForm />,
    document.getElementById('app')
);