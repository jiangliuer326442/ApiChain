import { Component, ReactNode } from 'react';
import ReactMde, { ReactMdeTypes } from 'react-mde';
import * as Showdown from 'showdown';
import 'react-mde/lib/styles/css/react-mde-all.css';

export default class extends Component {

    constructor(props) {
        super(props);

        this.state = {
            mdeState: {
                markdown: props.content,
            },
        }

        this.converter = new Showdown.Converter({
            omitExtraWLInCodeBlocks: true,
            parseImgDimensions: true,
            tables: true,
            tablesHeaderId: true,
            underline: true,
            simplifiedAutoLink: true,
            strikethrough: true,
            tasklists: true,
        });
    }

    render() : ReactNode {
        return (
            <ReactMde
                className="react_me"
                layout="horizontal"
                editorState={this.state.mdeState}
                generateMarkdownPreview={markdown => Promise.resolve(this.converter.makeHtml(markdown))}
                onChange={(mdeState: ReactMdeTypes.MdeState) => {
                    this.setState({ mdeState });
                    this.props.cb(mdeState.markdown);
                }}
            ></ReactMde>
        )
    }

}